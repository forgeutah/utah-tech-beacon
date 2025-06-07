
export const generateICalUrl = (selectedGroups: string[], selectedTags: string[]) => {
  const params = new URLSearchParams();
  if (selectedGroups.length > 0) {
    params.set('groups', selectedGroups.join(','));
  }
  if (selectedTags.length > 0) {
    params.set('tags', selectedTags.join(','));
  }
  
  return `https://gocvjqljtcxtcrwvfwez.supabase.co/functions/v1/generate-ical?${params.toString()}`;
};

export const generateRssUrl = (selectedGroups: string[], selectedTags: string[]) => {
  const params = new URLSearchParams();
  if (selectedGroups.length > 0) {
    params.set('groups', selectedGroups.join(','));
  }
  if (selectedTags.length > 0) {
    params.set('tags', selectedTags.join(','));
  }
  
  return `https://gocvjqljtcxtcrwvfwez.supabase.co/functions/v1/generate-rss?${params.toString()}`;
};
