# models/database.py
# Human Memories - Database Models avec SQLModel 2025

from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from uuid import UUID, uuid4
from enum import Enum

from sqlmodel import SQLModel, Field, Relationship, create_engine, Session, select, text
from sqlalchemy import JSON, Index, UniqueConstraint, CheckConstraint, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel, validator
import logging

logger = logging.getLogger(__name__)

# Enums pour la consistance
class HistoricalPeriod(str, Enum):
    prehistoric = "prehistoric"
    ancient_early = "ancient_early"
    ancient_classical = "ancient_classical"
    medieval_early = "medieval_early"
    medieval_late = "medieval_late"
    renaissance = "renaissance"
    industrial = "industrial"
    contemporary = "contemporary"

class TechCategory(str, Enum):
    survival = "survival"
    social = "social"
    cognitive = "cognitive"
    spiritual = "spiritual"
    economic = "economic"
    political = "political"
    military = "military"
    artistic = "artistic"
    scientific = "scientific"
    technological = "technological"

class TechRarity(str, Enum):
    pillar = "pillar"
    common = "common"
    uncommon = "uncommon"
    rare = "rare"
    legendary = "legendary"

class GameDifficulty(str, Enum):
    easy = "easy"
    normal = "normal"
    hard = "hard"

# Models SQLModel (avec tables)

class Technology(SQLModel, table=True):
    """Modèle des technologies"""
    __tablename__ = "technologies"
    
    # Primary key
    id: str = Field(primary_key=True, max_length=100)
    
    # Basic info
    name: str = Field(max_length=200, index=True)
    description: str = Field(max_length=2000)
    period: HistoricalPeriod = Field(index=True)
    category: TechCategory = Field(index=True)
    rarity: TechRarity = Field(default=TechRarity.common, index=True)
    
    # Historical context
    historical_context: str = Field(max_length=1000)
    discovery_date_range: str = Field(max_length=100)  # "3000-2500 BCE"
    
    # Dependencies (JSON columns)
    prerequisites: List[str] = Field(default_factory=list, sa_column_kwargs={"type": JSON})
    enables: List[str] = Field(default_factory=list, sa_column_kwargs={"type": JSON})
    blocks: List[str] = Field(default_factory=list, sa_column_kwargs={"type": JSON})
    
    # Synergies
    synergies: List[Dict[str, Any]] = Field(default_factory=list, sa_column_kwargs={"type": JSON})
    
    # Effects
    effects: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"type": JSON})
    
    # Narrative templates
    immediate_narrative_template: str = Field(max_length=2000)
    epoch_impact_template: str = Field(max_length=2000)
    final_consequence_template: str = Field(max_length=2000)
    
    # Metadata
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Relationships
    game_turns: List["GameTurn"] = Relationship(back_populates="offered_technologies")
    preserved_in_games: List["GameStatePreservedTech"] = Relationship(back_populates="technology")
    
    # Constraints et indexes
    __table_args__ = (
        Index('ix_tech_period_category', 'period', 'category'),
        Index('ix_tech_period_rarity', 'period', 'rarity'),
        CheckConstraint('length(name) > 0', name='check_name_not_empty'),
        CheckConstraint('length(description) > 0', name='check_description_not_empty'),
    )

class GameState(SQLModel, table=True):
    """État d'une partie de jeu"""
    __tablename__ = "game_states"
    
    # Primary key
    game_id: UUID = Field(primary_key=True, default_factory=uuid4)
    
    # Game info
    current_turn: int = Field(ge=1, le=12)
    current_period: HistoricalPeriod
    is_completed: bool = Field(default=False, index=True)
    
    # Player info
    player_name: Optional[str] = Field(None, max_length=100)
    difficulty: GameDifficulty = Field(default=GameDifficulty.normal)
    
    # Configuration
    configuration: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"type": JSON})
    
    # Player profile (computed at end)
    player_profile: Optional[Dict[str, Any]] = Field(None, sa_column_kwargs={"type": JSON})
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    
    # Relationships
    turns: List["GameTurn"] = Relationship(back_populates="game_state")
    preserved_techs: List["GameStatePreservedTech"] = Relationship(back_populates="game_state")
    
    # Indexes
    __table_args__ = (
        Index('ix_game_created_at', 'created_at'),
        Index('ix_game_completed', 'is_completed', 'completed_at'),
        Index('ix_game_player', 'player_name', 'created_at'),
    )

class GameTurn(SQLModel, table=True):
    """Tour de jeu avec les choix effectués"""
    __tablename__ = "game_turns"
    
    # Primary key
    id: UUID = Field(primary_key=True, default_factory=uuid4)
    
    # Foreign keys
    game_id: UUID = Field(foreign_key="game_states.game_id", index=True)
    
    # Turn info
    turn_number: int = Field(ge=1, le=12)
    period: HistoricalPeriod
    
    # Technologies
    offered_tech_ids: List[str] = Field(sa_column_kwargs={"type": JSON})
    chosen_tech_ids: List[str] = Field(sa_column_kwargs={"type": JSON})
    
    # Synergies triggered this turn
    synergies_triggered: List[Dict[str, Any]] = Field(default_factory=list, sa_column_kwargs={"type": JSON})
    
    # Timestamp
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Relationships
    game_state: GameState = Relationship(back_populates="turns")
    offered_technologies: List[Technology] = Relationship(
        link_table="game_turn_offered_techs",
        back_populates="game_turns"
    )
    
    # Constraints
    __table_args__ = (
        Index('ix_turn_game_turn', 'game_id', 'turn_number'),
        UniqueConstraint('game_id', 'turn_number', name='uq_game_turn'),
        CheckConstraint('turn_number > 0', name='check_turn_positive'),
    )

class GameStatePreservedTech(SQLModel, table=True):
    """Table de liaison pour les technologies préservées"""
    __tablename__ = "game_preserved_technologies"
    
    # Composite primary key
    game_id: UUID = Field(foreign_key="game_states.game_id", primary_key=True)
    tech_id: str = Field(foreign_key="technologies.id", primary_key=True, max_length=100)
    
    # When was it preserved
    turn_preserved: int = Field(ge=1, le=12)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Relationships
    game_state: GameState = Relationship(back_populates="preserved_techs")
    technology: Technology = Relationship(back_populates="preserved_in_games")
    
    # Indexes
    __table_args__ = (
        Index('ix_preserved_game_turn', 'game_id', 'turn_preserved'),
    )

# Table de liaison pour les technologies offertes par tour
class GameTurnOfferedTech(SQLModel, table=True):
    """Table de liaison pour les technologies offertes dans un tour"""
    __tablename__ = "game_turn_offered_techs"
    
    turn_id: UUID = Field(foreign_key="game_turns.id", primary_key=True)
    tech_id: str = Field(foreign_key="technologies.id", primary_key=True, max_length=100)

# Session et Game Analytics (optionnel pour le futur)
class GameSession(SQLModel, table=True):
    """Sessions de jeu pour l'authentification"""
    __tablename__ = "game_sessions"
    
    # Primary key
    session_id: str = Field(primary_key=True, max_length=255)
    
    # Foreign key
    game_id: UUID = Field(foreign_key="game_states.game_id", index=True)
    
    # Session data
    player_name: Optional[str] = Field(None, max_length=100)
    ip_address: Optional[str] = Field(None, max_length=45)  # IPv6 compatible
    user_agent: Optional[str] = Field(None, max_length=500)
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime
    last_activity: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Status
    is_active: bool = Field(default=True, index=True)
    
    # Indexes
    __table_args__ = (
        Index('ix_session_game_active', 'game_id', 'is_active'),
        Index('ix_session_expires', 'expires_at'),
    )

# Models Pydantic (sans tables) pour API
class TechnologyResponse(BaseModel):
    """Response model pour les technologies"""
    id: str
    name: str
    description: str
    period: HistoricalPeriod
    category: TechCategory
    rarity: TechRarity
    historical_context: str
    prerequisites: List[str]
    enables: List[str]
    effects: Dict[str, Any]

class GameStateResponse(BaseModel):
    """Response model pour l'état du jeu"""
    game_id: UUID
    current_turn: int
    current_period: HistoricalPeriod
    available_techs: List[str]
    preserved_techs_count: int
    is_completed: bool
    player_name: Optional[str]
    
class GameTurnResponse(BaseModel):
    """Response model pour un tour de jeu"""
    turn_number: int
    period: HistoricalPeriod
    offered_technologies: List[TechnologyResponse]
    chosen_technologies: List[TechnologyResponse]
    synergies_triggered: List[Dict[str, Any]]

# Database Manager
class DatabaseManager:
    """Manager pour la base de données"""
    
    def __init__(self, database_url: str = "sqlite:///human_memories.db"):
        self.database_url = database_url
        self.engine: Optional[Engine] = None
        self.SessionLocal: Optional[sessionmaker] = None
        
    async def initialize(self):
        """Initialiser la base de données"""
        try:
            # Create engine
            self.engine = create_engine(
                self.database_url,
                echo=False,  # Set to True for SQL debugging
                # SQLite-specific optimizations
                connect_args={"check_same_thread": False} if "sqlite" in self.database_url else {},
            )
            
            # Enable WAL mode for SQLite (better concurrency)
            if "sqlite" in self.database_url:
                @event.listens_for(self.engine, "connect")
                def set_sqlite_pragma(dbapi_connection, connection_record):
                    cursor = dbapi_connection.cursor()
                    cursor.execute("PRAGMA journal_mode=WAL")
                    cursor.execute("PRAGMA synchronous=NORMAL")
                    cursor.execute("PRAGMA cache_size=10000")
                    cursor.execute("PRAGMA temp_store=MEMORY")
                    cursor.close()
            
            # Create session factory
            self.SessionLocal = sessionmaker(
                autocommit=False,
                autoflush=False,
                bind=self.engine
            )
            
            # Create all tables
            SQLModel.metadata.create_all(self.engine)
            
            logger.info(f"Database initialized: {self.database_url}")
            
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")
            raise
    
    def get_session(self):
        """Obtenir une session de base de données"""
        if not self.SessionLocal:
            raise RuntimeError("Database not initialized")
        return self.SessionLocal()
    
    async def close(self):
        """Fermer la base de données"""
        if self.engine:
            self.engine.dispose()
            logger.info("Database connection closed")

    # Technology operations
    async def get_technologies(
        self,
        period: Optional[HistoricalPeriod] = None,
        category: Optional[TechCategory] = None,
        rarity: Optional[TechRarity] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Technology]:
        """Récupérer les technologies avec filtres"""
        with self.get_session() as session:
            stmt = select(Technology)
            
            # Apply filters
            if period:
                stmt = stmt.where(Technology.period == period)
            if category:
                stmt = stmt.where(Technology.category == category)
            if rarity:
                stmt = stmt.where(Technology.rarity == rarity)
            if search:
                stmt = stmt.where(
                    Technology.name.contains(search) |
                    Technology.description.contains(search)
                )
            
            # Apply pagination
            stmt = stmt.offset(offset).limit(limit)
            
            # Order by period, then category, then name
            stmt = stmt.order_by(Technology.period, Technology.category, Technology.name)
            
            return list(session.exec(stmt).all())
    
    async def get_technology_by_id(self, tech_id: str) -> Optional[Technology]:
        """Récupérer une technologie par ID"""
        with self.get_session() as session:
            return session.get(Technology, tech_id)
    
    async def get_technologies_by_period(
        self,
        period: HistoricalPeriod,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Technology]:
        """Récupérer toutes les technologies d'une période"""
        with self.get_session() as session:
            stmt = (
                select(Technology)
                .where(Technology.period == period)
                .order_by(Technology.category, Technology.name)
                .offset(offset)
                .limit(limit)
            )
            return list(session.exec(stmt).all())
    
    async def count_technologies(
        self,
        period: Optional[HistoricalPeriod] = None,
        category: Optional[TechCategory] = None,
        rarity: Optional[TechRarity] = None,
        search: Optional[str] = None,
    ) -> int:
        """Compter les technologies avec filtres"""
        with self.get_session() as session:
            stmt = select(func.count(Technology.id))
            
            # Apply same filters as get_technologies
            if period:
                stmt = stmt.where(Technology.period == period)
            if category:
                stmt = stmt.where(Technology.category == category)
            if rarity:
                stmt = stmt.where(Technology.rarity == rarity)
            if search:
                stmt = stmt.where(
                    Technology.name.contains(search) |
                    Technology.description.contains(search)
                )
            
            return session.exec(stmt).one()

    # Game state operations
    async def save_game_state(self, game_state: GameState) -> None:
        """Sauvegarder l'état d'un jeu"""
        with self.get_session() as session:
            session.add(game_state)
            session.commit()
            session.refresh(game_state)
    
    async def load_game_state(self, game_id: UUID) -> Optional[GameState]:
        """Charger l'état d'un jeu"""
        with self.get_session() as session:
            return session.get(GameState, game_id)
    
    async def delete_game_state(self, game_id: UUID) -> bool:
        """Supprimer un état de jeu"""
        with self.get_session() as session:
            game_state = session.get(GameState, game_id)
            if game_state:
                session.delete(game_state)
                session.commit()
                return True
            return False

# Factory pour les tests
def create_test_database() -> DatabaseManager:
    """Créer une base de données en mémoire pour les tests"""
    return DatabaseManager("sqlite:///:memory:")

# Utilitaires pour le seeding initial
async def seed_technologies(db_manager: DatabaseManager, technologies_data: List[Dict[str, Any]]):
    """Peupler la base avec les technologies initiales"""
    with db_manager.get_session() as session:
        for tech_data in technologies_data:
            # Convert dict to Technology model
            technology = Technology(**tech_data)
            session.add(technology)
        
        session.commit()
        logger.info(f"Seeded {len(technologies_data)} technologies")

# Export principal
__all__ = [
    "DatabaseManager",
    "Technology",
    "GameState", 
    "GameTurn",
    "GameSession",
    "HistoricalPeriod",
    "TechCategory",
    "TechRarity",
    "GameDifficulty",
    "TechnologyResponse",
    "GameStateResponse",
    "GameTurnResponse",
    "create_test_database",
    "seed_technologies",
]