// lib/captcha.js

/**
 * Generates a simple SVG captcha
 * @returns {Object} Object containing the captcha image SVG and code
 */
export async function generateCaptcha() {
    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create a simple SVG captcha
    const svgWidth = 150;
    const svgHeight = 50;
    
    // Function to get a random color
    const getRandomColor = () => {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };
    
    // Function to get a random number within a range
    const getRandomInt = (min, max) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    
    // Create the SVG with the captcha code
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
      <rect width="100%" height="100%" fill="white"/>`;
    
    // Add some random lines for noise
    for (let i = 0; i < 5; i++) {
      const x1 = getRandomInt(0, svgWidth);
      const y1 = getRandomInt(0, svgHeight);
      const x2 = getRandomInt(0, svgWidth);
      const y2 = getRandomInt(0, svgHeight);
      const color = getRandomColor();
      
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1"/>`;
    }
    
    // Add the text characters with varying positions
    let xPosition = 20;
    for (let i = 0; i < code.length; i++) {
      const fontSize = getRandomInt(20, 30);
      const yPosition = getRandomInt(25, 35);
      const rotation = getRandomInt(-10, 10);
      const color = getRandomColor();
      
      svg += `<text x="${xPosition}" y="${yPosition}" font-family="Arial" font-size="${fontSize}" fill="${color}" transform="rotate(${rotation}, ${xPosition}, ${yPosition})">${code[i]}</text>`;
      
      xPosition += 20;
    }
    
    // Add some random circles for noise
    for (let i = 0; i < 10; i++) {
      const cx = getRandomInt(0, svgWidth);
      const cy = getRandomInt(0, svgHeight);
      const r = getRandomInt(1, 3);
      const color = getRandomColor();
      
      svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>`;
    }
    
    svg += '</svg>';
    
    return {
      image: svg,
      code
    };
  }
  
  /**
   * Verifies a captcha code against the stored code in the cookie
   * @param {string} userCode - User submitted captcha code
   * @param {string} storedCode - Stored captcha code from cookie
   * @returns {boolean} Whether the captcha is valid
   */
  export function verifyCaptcha(userCode, storedCode) {
    if (!userCode || !storedCode) {
      return false;
    }
    
    // Simple case-insensitive comparison
    return userCode.toLowerCase() === storedCode.toLowerCase();
  }