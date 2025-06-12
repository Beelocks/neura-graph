import React, { useState } from 'react';

const Editor = ({ onCreateNode, onAIProcess, setAiSuggestions }) => {
  const [content, setContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setIsProcessing(true);
    const aiResult = await onAIProcess(content);
    setAiSuggestions(aiResult.relationships);
    
    // Create main node
    const nodeId = await onCreateNode(content, { 
      x: Math.random() * 100 - 50, 
      y: Math.random() * 100 - 50, 
      z: Math.random() * 100 - 50 
    });
    
    // Create related nodes
    for (const entity of aiResult.entities) {
      await onCreateNode(entity.word, { 
        x: Math.random() * 50 - 25, 
        y: Math.random() * 50 - 25, 
        z: Math.random() * 50 - 25 
      });
    }
    
    setContent('');
    setIsProcessing(false);
  };

  return (
    <div className="editor">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Ketik ide atau konsep..."
        disabled={isProcessing}
      />
      <button onClick={handleSubmit} disabled={isProcessing}>
        {isProcessing ? 'Memproses...' : 'Tambahkan Node + AI'}
      </button>
    </div>
  );
};

export default Editor;