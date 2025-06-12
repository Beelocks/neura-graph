import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from neo4j import GraphDatabase
from pydantic import BaseModel
from ai_engine import AIEngine

app = FastAPI()
ai_engine = AIEngine()

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Neo4j Connection
driver = GraphDatabase.driver(
    os.getenv("NEO4J_URI", "bolt://localhost:7687"),
    auth=(
        os.getenv("NEO4J_USER", "neo4j"),
        os.getenv("NEO4J_PASSWORD", "password")
    )
)

class NodeCreate(BaseModel):
    content: str
    x: float = 0
    y: float = 0
    z: float = 0

class RelationshipCreate(BaseModel):
    source_id: str
    target_id: str
    relationship_type: str = "RELATED"

@app.post("/nodes")
def create_node(node: NodeCreate):
    with driver.session() as session:
        result = session.write_transaction(
            lambda tx: tx.run(
                """
                CREATE (n:Node {
                    id: randomUUID(),
                    content: $content,
                    createdAt: datetime(),
                    position: point({x: $x, y: $y, z: $z})
                })
                RETURN n.id AS id, n.content AS content
                """,
                content=node.content,
                x=node.x, y=node.y, z=node.z
            )
        )
        record = result.single()
        return {"id": record["id"], "content": record["content"]}

@app.post("/relationships")
def create_relationship(rel: RelationshipCreate):
    with driver.session() as session:
        result = session.write_transaction(
            lambda tx: tx.run(
                """
                MATCH (a:Node {id: $source_id}), (b:Node {id: $target_id})
                MERGE (a)-[r:RELATIONSHIP {type: $rel_type}]->(b)
                RETURN a.id AS source, b.id AS target, r.type AS type
                """,
                source_id=rel.source_id,
                target_id=rel.target_id,
                rel_type=rel.relationship_type
            )
        )
        if result.peek() is None:
            raise HTTPException(status_code=404, detail="Nodes not found")
        record = result.single()
        return record.data()

@app.post("/ai/process")
def ai_process(content: str):
    # Extract entities and relationships
    entities = ai_engine.extract_entities(content)
    relations = ai_engine.extract_relationships(content)
    
    # Generate embeddings
    embedding = ai_engine.generate_embedding(content)
    
    return {
        "entities": entities,
        "relationships": relations,
        "embedding": embedding.tolist()
    }

@app.get("/graph")
def get_full_graph():
    with driver.session() as session:
        result = session.read_transaction(
            lambda tx: tx.run(
                """
                MATCH (n)-[r]->(m)
                RETURN {
                    nodes: COLLECT(DISTINCT {id: n.id, content: n.content, position: n.position}),
                    links: COLLECT(DISTINCT {
                        source: n.id, 
                        target: m.id, 
                        type: r.type
                    })
                }
                """
            )
        )
        return result.single().value()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)