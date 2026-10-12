document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => navMenu.classList.remove('open'));
    });
  }

  const videosGrid = document.getElementById('videosGrid');

  const API_KEY = 'PASTE_YOUR_API_KEY_HERE';

  async function loadVideos() {
    if (!videosGrid || !API_KEY || API_KEY === 'PASTE_YOUR_API_KEY_HERE') {
      if (videosGrid) {
        videosGrid.innerHTML = `
          <div class="empty-status">
            Add a YouTube Data API key to show the latest uploads here automatically.
          </div>
        `;
      }
      return;
    }

    try {
      const channelUrl = new URL('https://www.googleapis.com/youtube/v3/channels');
      channelUrl.search = new URLSearchParams({
        part: 'contentDetails',
        forHandle: 'Reshwanth_YT',
        key: API_KEY
      }).toString();

      const channelResponse = await fetch(channelUrl);
      if (!channelResponse.ok) throw new Error('Channel lookup failed');

      const channelData = await channelResponse.json();
      const channel = channelData.items?.[0];
      if (!channel) throw new Error('Channel not found');

      const playlistId = channel.contentDetails.relatedPlaylists.uploads;
      const playlistUrl = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
      playlistUrl.search = new URLSearchParams({
        part: 'snippet',
        playlistId,
        maxResults: '8',
        key: API_KEY
      }).toString();

      const playlistResponse = await fetch(playlistUrl);
      if (!playlistResponse.ok) throw new Error('Playlist lookup failed');

      const playlistData = await playlistResponse.json();
      const videos = playlistData.items || [];

      videosGrid.innerHTML = '';

      if (!videos.length) {
        videosGrid.innerHTML = `
          <div class="empty-status">
            No public uploads were returned. Visit the official channel to browse videos.
          </div>
        `;
        return;
      }

      videos.forEach((item) => {
        const snippet = item.snippet;
        const videoId = item.snippet?.resourceId?.videoId || item.id;
        const title = snippet?.title || 'YouTube Video';
        const published = snippet?.publishedAt ? new Date(snippet.publishedAt).toLocaleDateString() : 'YouTube upload';
        const thumbnail = snippet?.thumbnails?.maxres || snippet?.thumbnails?.high || snippet?.thumbnails?.medium || {};

        const card = document.createElement('a');
        card.href = `https://www.youtube.com/watch?v=${videoId}`;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'video-card';

        card.innerHTML = `
          <div class="video-thumb">
            <img src="${thumbnail.url || 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80'}" alt="${title}" loading="lazy">
            <span class="play-badge" aria-hidden="true"></span>
          </div>
          <div class="video-info">
            <h3>${title}</h3>
            <div class="video-meta">${published}</div>
          </div>
        `;

        videosGrid.appendChild(card);
      });
    } catch (error) {
      videosGrid.innerHTML = `
        <div class="empty-status">
          Videos could not load. Check the API key, access permissions, quota, and website restrictions.
        </div>
      `;
    }
  }

  loadVideos();
});
