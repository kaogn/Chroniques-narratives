# main.py
# Human Memories - FastAPI Backend 2025

from contextlib import asynccontextmanager
from typing import Annotated, Optional
import asyncio
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.security import HTTPBearer
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, UUID4
from pydantic_settings import BaseSettings, SettingsConfigDict
import uvicorn
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .routers import technologies, game, health
from .core.database import DatabaseManager
from .core.game_engine import GameEngineService
from .core.security import SecurityManager
from .middleware.logging import LoggingMiddleware
from .middleware.metrics import MetricsMiddleware

# Configuration avec Pydantic Settings
class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )
    
    # App Settings
    app_name: str = "Human Memories API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Security
    secret_key: str = Field(..., min_length=32)
    allowed_hosts: list[str] = ["localhost", "127.0.0.1", "humanmemories.app"]
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://humanmemories.app"
    ]
    
    # Database
    database_url: str = "sqlite:///./human_memories.db"
    database_echo: bool = False
    
    # Rate Limiting
    rate_limit_requests_per_minute: int = 60
    rate_limit_burst: int = 10
    
    # Redis (for production caching/sessions)
    redis_url: Optional[str] = None
    redis_expire_seconds: int = 3600
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "json"

settings = Settings()

# Setup logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s" if settings.log_format == "text" 
           else None,
    handlers=[logging.StreamHandler(sys.stdout)],
)

logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# Global services
db_manager: Optional[DatabaseManager] = None
game_engine: Optional[GameEngineService] = None
security_manager: Optional[SecurityManager] = None

# Lifespan events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager avec startup/shutdown modernes"""
    # Startup
    logger.info("🚀 Starting Human Memories API...")
    
    global db_manager, game_engine, security_manager
    
    try:
        # Initialize database
        db_manager = DatabaseManager(settings.database_url)
        await db_manager.initialize()
        logger.info("✅ Database initialized")
        
        # Initialize game engine
        game_engine = GameEngineService(db_manager)
        await game_engine.initialize()
        logger.info("✅ Game engine initialized")
        
        # Initialize security
        security_manager = SecurityManager(settings.secret_key)
        logger.info("✅ Security manager initialized")
        
        # Load technologies data
        await load_initial_data()
        logger.info("✅ Initial data loaded")
        
        logger.info("🎮 Human Memories API ready!")
        
    except Exception as e:
        logger.error(f"❌ Failed to start application: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Human Memories API...")
    
    if db_manager:
        await db_manager.close()
        logger.info("✅ Database closed")
    
    logger.info("👋 Goodbye!")

# Create FastAPI app avec patterns 2025
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Backend API for Human Memories - The Collective Memory Game",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan,
    # Modern FastAPI response model
    default_response_class=JSONResponse,
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=settings.allowed_hosts
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=86400,  # 24h cache for preflight
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Custom middleware
app.add_middleware(LoggingMiddleware)
app.add_middleware(MetricsMiddleware)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Include routers
app.include_router(
    health.router,
    prefix="/api/v1/health",
    tags=["health"]
)

app.include_router(
    technologies.router,
    prefix="/api/v1/technologies",
    tags=["technologies"]
)

app.include_router(
    game.router,
    prefix="/api/v1/game",
    tags=["game"]
)

# Root endpoint
@app.get("/")
async def root():
    """API root avec information basique"""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "operational",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "docs": "/docs" if settings.debug else "Contact administrator",
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handler d'exception global avec logging structuré"""
    logger.error(
        f"Unhandled exception: {exc}",
        extra={
            "request_url": str(request.url),
            "request_method": request.method,
            "client_ip": get_remote_address(request),
            "exception_type": type(exc).__name__,
        }
    )
    
    if settings.debug:
        raise exc
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "request_id": getattr(request.state, "request_id", None),
        }
    )

# Data loading
async def load_initial_data():
    """Charge les données initiales dans la base"""
    if not db_manager:
        raise RuntimeError("Database manager not initialized")
    
    # Load technologies from JSON
    technologies_file = Path("data/technologies.json")
    if technologies_file.exists():
        await db_manager.load_technologies_from_file(technologies_file)
        logger.info(f"✅ Technologies loaded from {technologies_file}")
    else:
        logger.warning(f"⚠️  Technologies file not found: {technologies_file}")
        # Create sample data for development
        await create_sample_technologies()

async def create_sample_technologies():
    """Crée des données d'exemple pour le développement"""
    logger.info("Creating sample technologies...")
    # This would create the basic technologies for testing
    # Implementation depends on DatabaseManager

# Dependencies pour injection
async def get_database() -> DatabaseManager:
    if not db_manager:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database not available"
        )
    return db_manager

async def get_game_engine() -> GameEngineService:
    if not game_engine:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Game engine not available"
        )
    return game_engine

async def get_security_manager() -> SecurityManager:
    if not security_manager:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Security manager not available"
        )
    return security_manager

# Type aliases pour les dépendances
DatabaseDep = Annotated[DatabaseManager, Depends(get_database)]
GameEngineDep = Annotated[GameEngineService, Depends(get_game_engine)]
SecurityDep = Annotated[SecurityManager, Depends(get_security_manager)]

# Development server
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        access_log=settings.debug,
        log_config={
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                },
                "access": {
                    "format": "%(asctime)s - ACCESS - %(message)s",
                },
            },
            "handlers": {
                "default": {
                    "formatter": "default",
                    "class": "logging.StreamHandler",
                    "stream": "ext://sys.stdout",
                },
                "access": {
                    "formatter": "access",
                    "class": "logging.StreamHandler",
                    "stream": "ext://sys.stdout",
                },
            },
            "loggers": {
                "uvicorn": {"handlers": ["default"], "level": "INFO"},
                "uvicorn.error": {"level": "INFO"},
                "uvicorn.access": {"handlers": ["access"], "level": "INFO", "propagate": False},
            },
        }
    )

# routers/game.py
# Human Memories - Game Router 2025

from typing import Annotated, List, Optional
from datetime import datetime, timezone
from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer
from pydantic import BaseModel, Field
from slowapi import Limiter
from slowapi.util import get_remote_address

from ..core.game_engine import GameEngineService, GameState
from ..core.security import SecurityManager
from ..models.game import CreateGameRequest, PreserveTechRequest, GameResponse
from ..utils.responses import success_response, error_response

router = APIRouter()
security = HTTPBearer(auto_error=False)
limiter = Limiter(key_func=get_remote_address)

# Rate limiting decorators
game_create_limit = limiter.limit("5/minute")
game_action_limit = limiter.limit("30/minute")

@router.post("/create", response_model=GameResponse)
@game_create_limit
async def create_game(
    request: Request,
    create_request: CreateGameRequest,
    game_engine: Annotated[GameEngineService, Depends()],
    security_manager: Annotated[SecurityManager, Depends()],
):
    """
    Créer une nouvelle partie
    
    Rate limit: 5 requests per minute
    """
    try:
        # Create game session
        game_state = await game_engine.create_game(
            player_name=create_request.player_name,
            difficulty=create_request.difficulty,
        )
        
        # Generate session token
        session_token = await security_manager.create_session(
            game_id=game_state.game_id,
            player_name=create_request.player_name,
        )
        
        return success_response(
            data={
                "game_state": game_state.model_dump(),
                "session_token": session_token,
            },
            message="Game created successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create game: {str(e)}"
        )

@router.post("/preserve", response_model=GameResponse)
@game_action_limit
async def preserve_technologies(
    request: Request,
    preserve_request: PreserveTechRequest,
    game_engine: Annotated[GameEngineService, Depends()],
    security_manager: Annotated[SecurityManager, Depends()],
    token: Annotated[str, Depends(security)],
):
    """
    Préserver des technologies
    
    Rate limit: 30 requests per minute
    Requires: Valid session token
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token required"
        )
    
    try:
        # Validate session
        session = await security_manager.validate_session(token.credentials)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired session"
            )
        
        # Execute game action
        result = await game_engine.preserve_technologies(
            game_id=session.game_id,
            tech_ids=preserve_request.tech_ids,
        )
        
        return success_response(
            data=result.model_dump(),
            message="Technologies preserved successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to preserve technologies: {str(e)}"
        )

@router.get("/state/{game_id}", response_model=GameResponse)
@game_action_limit
async def get_game_state(
    request: Request,
    game_id: UUID,
    game_engine: Annotated[GameEngineService, Depends()],
    security_manager: Annotated[SecurityManager, Depends()],
    token: Annotated[str, Depends(security)],
):
    """
    Récupérer l'état d'une partie
    
    Rate limit: 30 requests per minute
    Requires: Valid session token
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token required"
        )
    
    try:
        # Validate session
        session = await security_manager.validate_session(token.credentials)
        if not session or session.game_id != game_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this game"
            )
        
        # Get game state
        game_state = await game_engine.get_game_state(game_id)
        if not game_state:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Game not found"
            )
        
        return success_response(
            data=game_state.model_dump(),
            message="Game state retrieved successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve game state: {str(e)}"
        )

@router.post("/chronicle/{game_id}", response_model=GameResponse)
@game_action_limit
async def generate_chronicle(
    request: Request,
    game_id: UUID,
    game_engine: Annotated[GameEngineService, Depends()],
    security_manager: Annotated[SecurityManager, Depends()],
    token: Annotated[str, Depends(security)],
):
    """
    Générer la chronique finale
    
    Rate limit: 30 requests per minute
    Requires: Valid session token, completed game
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token required"
        )
    
    try:
        # Validate session
        session = await security_manager.validate_session(token.credentials)
        if not session or session.game_id != game_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this game"
            )
        
        # Generate chronicle
        chronicle = await game_engine.generate_final_chronicle(game_id)
        
        return success_response(
            data=chronicle.model_dump(),
            message="Final chronicle generated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to generate chronicle: {str(e)}"
        )

@router.delete("/session", response_model=GameResponse)
async def end_session(
    request: Request,
    security_manager: Annotated[SecurityManager, Depends()],
    token: Annotated[str, Depends(security)],
):
    """
    Terminer une session de jeu
    
    Requires: Valid session token
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token required"
        )
    
    try:
        # Invalidate session
        success = await security_manager.invalidate_session(token.credentials)
        
        if success:
            return success_response(
                data=None,
                message="Session ended successfully"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to end session"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to end session: {str(e)}"
        )

# routers/technologies.py
# Human Memories - Technologies Router 2025

from typing import Annotated, List, Optional
from enum import Enum

from fastapi import APIRouter, HTTPException, Depends, Query, status, Request
from pydantic import BaseModel, Field
from slowapi import Limiter
from slowapi.util import get_remote_address

from ..core.database import DatabaseManager
from ..models.technology import Technology, HistoricalPeriod, TechCategory
from ..utils.responses import success_response, error_response

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# Rate limiting
tech_query_limit = limiter.limit("100/minute")

class TechnologyQuery(BaseModel):
    """Query parameters for technology endpoints"""
    period: Optional[HistoricalPeriod] = None
    category: Optional[TechCategory] = None
    rarity: Optional[str] = None
    search: Optional[str] = Field(None, max_length=100)
    limit: int = Field(50, ge=1, le=200)
    offset: int = Field(0, ge=0)

@router.get("/", response_model=dict)
@tech_query_limit
async def get_technologies(
    request: Request,
    query: Annotated[TechnologyQuery, Depends()],
    db: Annotated[DatabaseManager, Depends()],
):
    """
    Récupérer les technologies avec filtres
    
    Rate limit: 100 requests per minute
    
    - **period**: Filtrer par période historique
    - **category**: Filtrer par catégorie
    - **rarity**: Filtrer par rareté
    - **search**: Recherche textuelle dans nom/description
    - **limit**: Nombre maximum de résultats (1-200)
    - **offset**: Décalage pour pagination
    """
    try:
        technologies = await db.get_technologies(
            period=query.period,
            category=query.category,
            rarity=query.rarity,
            search=query.search,
            limit=query.limit,
            offset=query.offset,
        )
        
        total_count = await db.count_technologies(
            period=query.period,
            category=query.category,
            rarity=query.rarity,
            search=query.search,
        )
        
        return success_response(
            data={
                "technologies": [tech.model_dump() for tech in technologies],
                "pagination": {
                    "total": total_count,
                    "limit": query.limit,
                    "offset": query.offset,
                    "has_more": total_count > query.offset + query.limit,
                },
                "filters": query.model_dump(exclude_unset=True),
            },
            message=f"Retrieved {len(technologies)} technologies"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve technologies: {str(e)}"
        )

@router.get("/{tech_id}", response_model=dict)
@tech_query_limit
async def get_technology_by_id(
    request: Request,
    tech_id: str = Field(..., min_length=1, max_length=100),
    db: Annotated[DatabaseManager, Depends()] = None,
):
    """
    Récupérer une technologie par son ID
    
    Rate limit: 100 requests per minute
    """
    try:
        technology = await db.get_technology_by_id(tech_id)
        
        if not technology:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Technology '{tech_id}' not found"
            )
        
        return success_response(
            data=technology.model_dump(),
            message="Technology retrieved successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve technology: {str(e)}"
        )

@router.get("/period/{period}", response_model=dict)
@tech_query_limit
async def get_technologies_by_period(
    request: Request,
    period: HistoricalPeriod,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Annotated[DatabaseManager, Depends()] = None,
):
    """
    Récupérer les technologies d'une période spécifique
    
    Rate limit: 100 requests per minute
    """
    try:
        technologies = await db.get_technologies_by_period(
            period=period,
            limit=limit,
            offset=offset,
        )
        
        total_count = await db.count_technologies(period=period)
        
        return success_response(
            data={
                "technologies": [tech.model_dump() for tech in technologies],
                "period": period,
                "pagination": {
                    "total": total_count,
                    "limit": limit,
                    "offset": offset,
                    "has_more": total_count > offset + limit,
                },
            },
            message=f"Retrieved {len(technologies)} technologies from {period}"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve technologies: {str(e)}"
        )

@router.get("/dependencies/{tech_id}", response_model=dict)
@tech_query_limit
async def get_technology_dependencies(
    request: Request,
    tech_id: str = Field(..., min_length=1, max_length=100),
    db: Annotated[DatabaseManager, Depends()] = None,
):
    """
    Récupérer les dépendances d'une technologie
    
    Rate limit: 100 requests per minute
    """
    try:
        # Get the technology
        technology = await db.get_technology_by_id(tech_id)
        if not technology:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Technology '{tech_id}' not found"
            )
        
        # Get dependency details
        dependencies_data = await db.get_technology_dependencies(tech_id)
        
        return success_response(
            data={
                "technology_id": tech_id,
                "dependencies": dependencies_data,
            },
            message="Dependencies retrieved successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve dependencies: {str(e)}"
        )

@router.get("/stats/overview", response_model=dict)
@tech_query_limit
async def get_technology_stats(
    request: Request,
    db: Annotated[DatabaseManager, Depends()] = None,
):
    """
    Récupérer les statistiques des technologies
    
    Rate limit: 100 requests per minute
    """
    try:
        stats = await db.get_technology_stats()
        
        return success_response(
            data=stats,
            message="Statistics retrieved successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve statistics: {str(e)}"
        )

# core/game_engine.py
# Human Memories - Game Engine Service 2025

import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Set
from uuid import UUID, uuid4

from pydantic import BaseModel, Field
from .database import DatabaseManager
from .narrative_engine import NarrativeEngine
from ..models.game import GameState, GameTurn, PlayerProfile
from ..models.technology import Technology, HistoricalPeriod

logger = logging.getLogger(__name__)

class GameConfiguration(BaseModel):
    """Configuration du jeu"""
    max_techs_per_turn: int = Field(3, ge=2, le=5)
    max_preserved_per_turn: int = Field(2, ge=1, le=3) 
    total_turns: int = Field(8, ge=6, le=12)
    difficulty: str = Field("normal", regex="^(easy|normal|hard)$")
    enable_synergies: bool = True
    narrative_mode: str = Field("standard", regex="^(minimal|standard|verbose)$")

class PreserveResult(BaseModel):
    """Résultat de préservation de technologies"""
    updated_state: GameState
    narratives: List[str]
    is_game_complete: bool
    synergies_triggered: List[Dict[str, str]] = []

class FinalChronicle(BaseModel):
    """Chronique finale du jeu"""
    chronicle: str
    reflection: str
    epitaph: str
    player_profile: PlayerProfile
    game_stats: Dict[str, int]

class GameEngineService:
    """Service principal du moteur de jeu"""
    
    def __init__(self, database_manager: DatabaseManager):
        self.db = database_manager
        self.narrative = NarrativeEngine(database_manager)
        self.config = GameConfiguration()
        self.active_games: Dict[UUID, GameState] = {}
        self._logger = logging.getLogger(__name__)

    async def initialize(self):
        """Initialisation du service"""
        try:
            await self.narrative.initialize()
            self._logger.info("Game engine service initialized")
        except Exception as e:
            self._logger.error(f"Failed to initialize game engine: {e}")
            raise

    async def create_game(
        self,
        player_name: Optional[str] = None,
        difficulty: str = "normal",
        custom_config: Optional[GameConfiguration] = None,
    ) -> GameState:
        """
        Créer une nouvelle partie
        
        Args:
            player_name: Nom du joueur (optionnel)
            difficulty: Niveau de difficulté
            custom_config: Configuration personnalisée
            
        Returns:
            GameState: État initial du jeu
        """
        try:
            # Generate game ID
            game_id = uuid4()
            
            # Apply custom configuration
            config = custom_config or GameConfiguration(difficulty=difficulty)
            
            # Get first period technologies
            first_period = HistoricalPeriod.prehistoric
            period_technologies = await self.db.get_technologies_by_period(first_period)
            
            # Select initial technologies based on difficulty
            initial_techs = await self._select_turn_technologies(
                period_technologies,
                config.max_techs_per_turn,
                difficulty,
                []
            )
            
            # Create initial game state
            game_state = GameState(
                game_id=game_id,
                current_turn=1,
                current_period=first_period,
                preserved_techs=[],
                available_techs=[tech.id for tech in initial_techs],
                player_profile=None,
                game_history=[],
                is_completed=False,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
                player_name=player_name,
                difficulty=difficulty,
                configuration=config.model_dump(),
            )
            
            # Store in memory and database
            self.active_games[game_id] = game_state
            await self.db.save_game_state(game_state)
            
            self._logger.info(f"Game created: {game_id} for player: {player_name or 'Anonymous'}")
            return game_state
            
        except Exception as e:
            self._logger.error(f"Failed to create game: {e}")
            raise

    async def preserve_technologies(
        self,
        game_id: UUID,
        tech_ids: List[str],
    ) -> PreserveResult:
        """
        Préserver des technologies pour un tour
        
        Args:
            game_id: ID de la partie
            tech_ids: Liste des IDs des technologies à préserver
            
        Returns:
            PreserveResult: Résultat de la préservation
        """
        try:
            # Get current game state
            game_state = await self._get_game_state(game_id)
            if not game_state:
                raise ValueError(f"Game {game_id} not found")
            
            # Validate selection
            await self._validate_technology_selection(game_state, tech_ids)
            
            # Generate immediate narratives
            narratives = await self._generate_immediate_narratives(tech_ids)
            
            # Update preserved technologies
            preserved_techs = game_state.preserved_techs + tech_ids
            
            # Check for synergies
            synergies = await self._check_synergies(preserved_techs)
            
            # Create turn record
            game_turn = GameTurn(
                turn=game_state.current_turn,
                period=game_state.current_period,
                offered_techs=game_state.available_techs,
                chosen_techs=tech_ids,
                timestamp=datetime.now(timezone.utc),
                synergies_triggered=synergies,
            )
            
            # Check if game is complete
            is_last_turn = game_state.current_turn >= self.config.total_turns
            
            if is_last_turn:
                # Complete the game
                player_profile = await self._analyze_player_choices(
                    game_state.game_history + [game_turn]
                )
                
                updated_state = game_state.model_copy(update={
                    "preserved_techs": preserved_techs,
                    "player_profile": player_profile,
                    "game_history": game_state.game_history + [game_turn],
                    "is_completed": True,
                    "updated_at": datetime.now(timezone.utc),
                })
                
            else:
                # Prepare next turn
                next_turn = game_state.current_turn + 1
                next_period = self._get_next_period(game_state.current_period)
                
                # Generate technologies for next turn
                next_techs = await self._generate_next_turn_technologies(
                    next_period,
                    preserved_techs,
                    game_state.difficulty
                )
                
                updated_state = game_state.model_copy(update={
                    "current_turn": next_turn,
                    "current_period": next_period,
                    "preserved_techs": preserved_techs,
                    "available_techs": [tech.id for tech in next_techs],
                    "game_history": game_state.game_history + [game_turn],
                    "updated_at": datetime.now(timezone.utc),
                })
            
            # Save updated state
            self.active_games[game_id] = updated_state
            await self.db.save_game_state(updated_state)
            
            result = PreserveResult(
                updated_state=updated_state,
                narratives=narratives,
                is_game_complete=is_last_turn,
                synergies_triggered=synergies,
            )
            
            self._logger.info(f"Technologies preserved for game {game_id}: {tech_ids}")
            return result
            
        except Exception as e:
            self._logger.error(f"Failed to preserve technologies: {e}")
            raise

    async def generate_final_chronicle(self, game_id: UUID) -> FinalChronicle:
        """
        Générer la chronique finale d'une partie
        
        Args:
            game_id: ID de la partie
            
        Returns:
            FinalChronicle: Chronique finale complète
        """
        try:
            game_state = await self._get_game_state(game_id)
            if not game_state or not game_state.is_completed:
                raise ValueError("Game not completed")
            
            if not game_state.player_profile:
                raise ValueError("Player profile missing")
            
            # Generate chronicle components
            chronicle = await self.narrative.generate_final_chronicle(
                game_state.game_history,
                game_state.preserved_techs
            )
            
            reflection = await self.narrative.generate_reflection(
                game_state.player_profile
            )
            
            epitaph = await self.narrative.generate_epitaph(
                game_state.player_profile
            )
            
            # Calculate game statistics
            game_stats = await self._calculate_game_stats(game_state)
            
            final_chronicle = FinalChronicle(
                chronicle=chronicle,
                reflection=reflection,
                epitaph=epitaph,
                player_profile=game_state.player_profile,
                game_stats=game_stats,
            )
            
            self._logger.info(f"Final chronicle generated for game {game_id}")
            return final_chronicle
            
        except Exception as e:
            self._logger.error(f"Failed to generate final chronicle: {e}")
            raise

    # Private helper methods
    
    async def _get_game_state(self, game_id: UUID) -> Optional[GameState]:
        """Récupérer l'état d'un jeu"""
        # Try memory first
        if game_id in self.active_games:
            return self.active_games[game_id]
        
        # Fallback to database
        return await self.db.load_game_state(game_id)
    
    async def _validate_technology_selection(self, game_state: GameState, tech_ids: List[str]):
        """Valider la sélection de technologies"""
        if len(tech_ids) == 0 or len(tech_ids) > self.config.max_preserved_per_turn:
            raise ValueError(f"Must select 1-{self.config.max_preserved_per_turn} technologies")
        
        for tech_id in tech_ids:
            if tech_id not in game_state.available_techs:
                raise ValueError(f"Technology {tech_id} not available")
        
        if len(set(tech_ids)) != len(tech_ids):
            raise ValueError("Cannot select the same technology twice")
    
    async def _generate_immediate_narratives(self, tech_ids: List[str]) -> List[str]:
        """Générer les narratives immédiates"""
        narratives = []
        for tech_id in tech_ids:
            narrative = await self.narrative.generate_immediate(tech_id)
            narratives.append(narrative)
        return narratives
    
    def _get_next_period(self, current_period: HistoricalPeriod) -> HistoricalPeriod:
        """Déterminer la prochaine période historique"""
        periods = list(HistoricalPeriod)
        current_index = periods.index(current_period)
        return periods[min(current_index + 1, len(periods) - 1)]
    
    # Additional helper methods would be implemented here...
    # _select_turn_technologies, _check_synergies, _analyze_player_choices, etc.