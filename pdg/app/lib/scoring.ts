export function scoreArgument(text: string): number {
    // Party game scoring is totally silly and somewhat random
    if (!text || text.trim() === "") return 50; // Pity votes
    
    let score = 200; 
    score += Math.min(text.length * 3, 500); // Reward length
    score += Math.floor(Math.random() * 300); // Chaos factor
    
    // Keywords
    const hypeWords = ['economy', 'pizza', 'dance', 'alien', 'taxes', 'cat', 'dog', 'future', 'ice cream', 'freedom'];
    const lower = text.toLowerCase();
    hypeWords.forEach(w => {
        if (lower.includes(w)) score += 150 + Math.floor(Math.random()*150);
    });
    
    // Exclamation marks rule!
    const exclamations = (text.match(/!/g) || []).length;
    score += exclamations * 50;
    
    return score;
}
