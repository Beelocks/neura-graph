from transformers import pipeline
from sentence_transformers import SentenceTransformer
import torch

class AIEngine:
    def __init__(self):
        self.entity_extractor = pipeline(
            "ner", 
            grouped_entities=True,
            model="dbmdz/bert-large-cased-finetuned-conll03-english"
        )
        self.rel_extractor = pipeline(
            "text2text-generation", 
            model="Babelshot/rebel-large"
        )
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        if torch.cuda.is_available():
            self.entity_extractor.device = 0
            self.rel_extractor.device = 0
            self.embedding_model = self.embedding_model.to('cuda')

    def extract_entities(self, text):
        return self.entity_extractor(text)

    def extract_relationships(self, text):
        results = self.rel_extractor(text, max_length=512)
        relationships = []
        for res in results:
            for rel in res['generated_text'].split("<triplet>"):
                if rel.strip():
                    parts = rel.split("<subj>")
                    if len(parts) >= 3:
                        relationships.append({
                            "subject": parts[0].strip(),
                            "predicate": parts[1].strip(),
                            "object": parts[2].strip()
                        })
        return relationships

    def generate_embedding(self, text):
        return self.embedding_model.encode([text])[0]