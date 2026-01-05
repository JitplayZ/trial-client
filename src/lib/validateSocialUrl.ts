/**
 * Validates that a URL is from an allowed social media platform.
 * Must be HTTPS and from: X/Twitter, LinkedIn, Reddit, or YouTube
 */
export function validateSocialUrl(url: string): { valid: boolean; error?: string } {
  const trimmedUrl = url.trim();
  
  if (!trimmedUrl) {
    return { valid: false, error: 'URL is required' };
  }

  try {
    const parsed = new URL(trimmedUrl);
    
    if (parsed.protocol !== 'https:') {
      return { valid: false, error: 'URL must use HTTPS' };
    }

    const hostname = parsed.hostname.toLowerCase();
    const allowedDomains = [
      'x.com', 'www.x.com',
      'twitter.com', 'www.twitter.com',
      'linkedin.com', 'www.linkedin.com',
      'reddit.com', 'www.reddit.com',
      'youtube.com', 'www.youtube.com',
      'youtu.be'
    ];

    const isAllowedDomain = allowedDomains.some(domain => hostname === domain);
    
    if (!isAllowedDomain) {
      return { 
        valid: false, 
        error: 'URL must be from X/Twitter, LinkedIn, Reddit, or YouTube' 
      };
    }

    // Check that there's a valid path (not just the domain)
    if (!parsed.pathname || parsed.pathname === '/') {
      return { 
        valid: false, 
        error: 'Please provide a direct link to your post, not just the platform homepage' 
      };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Please enter a valid URL' };
  }
}
