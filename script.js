document.addEventListener('DOMContentLoaded', () => {
      const folderList = document.getElementById('folderList');
      const imageGrid = document.getElementById('imageGrid');
      const grid = document.getElementById('grid');
      const backBtn = document.getElementById('backBtn');
      const slideshowOverlay = document.getElementById('slideshowOverlay');
      const slideshowContent = document.getElementById('slideshowContent');
      const filename = document.getElementById('imageFilename');
      let currentIndex = 0;
      let currentMedia = [];

      // Button Event Listeners
      document.getElementById('haneameBtn').addEventListener('click', () => loadCosplayer('data/haneame.json'));
      document.getElementById('fantasyFactoryBtn').addEventListener('click', () => loadCosplayer('data/fantasyfactory.json'));

      function loadCosplayer(jsonFile) {
        fetch(jsonFile)
          .then(response => response.json())
          .then(jsonData => populateFolders(jsonData))
          .catch(error => console.error('Error loading JSON:', error));
      }

      function populateFolders(jsonData) {
        folderList.innerHTML = ''; // Clear any previous folders
        folderList.classList.remove('hidden');
        imageGrid.classList.add('hidden');

        jsonData.folders.forEach(folder => {
          const folderDiv = document.createElement('div');
          folderDiv.classList.add('bg-gray-700', 'p-4', 'rounded-lg', 'cursor-pointer', 'hover:bg-gray-600');
          folderDiv.innerText = folder;
          folderDiv.addEventListener('click', () => showMedia(folder, jsonData));
          folderList.appendChild(folderDiv);
        });
      }

      function showMedia(folder, jsonData) {
        folderList.classList.add('hidden');
        imageGrid.classList.remove('hidden');

        backBtn.addEventListener('click', () => {
          folderList.classList.remove('hidden');
          imageGrid.classList.add('hidden');
        });

        const media = jsonData.images[folder];
        grid.innerHTML = ''; // Clear any existing content

        media.forEach((mediaData, index) => {
          const { url, title, type } = parseMediaData(mediaData);

          const mediaDiv = document.createElement('div');
          mediaDiv.classList.add('relative', 'bg-gray-800', 'p-4', 'rounded-lg');

          let mediaElement;
          if (type === 'video') {
            mediaElement = createVideoElement(url);
          } else {
            mediaElement = document.createElement('img');
            mediaElement.classList.add('w-40', 'h-auto', 'rounded-lg');
            mediaElement.src = url;
            mediaElement.alt = title || `Media ${index + 1}`;
          }

          const filename = document.createElement('p');
          filename.classList.add('text-center', 'mt-2', 'text-sm');
          filename.innerText = title || `Media ${index + 1}`;

          mediaDiv.appendChild(mediaElement);
          mediaDiv.appendChild(filename);
          mediaDiv.addEventListener('click', () => openSlideshow(index, media));
          grid.appendChild(mediaDiv);
        });
      }

      function parseMediaData(mediaData) {
        const regex = /(?<url>https:\/\/[^\s]+)(?:\s\[(?<title>.+?)\])?(?:\s\((?<type>image|video)\))?/;
        const match = mediaData.match(regex);
        return {
          url: match ? match.groups.url : '',
          title: match && match.groups.title ? match.groups.title : null,
          type: match && match.groups.type ? match.groups.type : 'image',
        };
      }

      function openSlideshow(index, media) {
        currentIndex = index;
        currentMedia = media;
        showSlideshow();
      }

      function showSlideshow() {
        if (!currentMedia || currentIndex < 0 || currentIndex >= currentMedia.length) return;

        const { url, title, type } = parseMediaData(currentMedia[currentIndex]);
        slideshowContent.innerHTML = ''; // Clear previous content

        let mediaElement;
        if (type === 'video') {
          mediaElement = createVideoElement(url);
        } else {
          mediaElement = document.createElement('img');
          mediaElement.classList.add('max-w-full', 'rounded-lg');
          mediaElement.src = url;
          mediaElement.alt = title || `Media ${currentIndex + 1}`;
        }

        slideshowContent.appendChild(mediaElement);
        filename.innerText = title || `Media ${currentIndex + 1}`;
        slideshowOverlay.classList.remove('hidden');
      }

      function createVideoElement(url) {
        const video = document.createElement('video');
        video.classList.add('max-w-full', 'rounded-lg');
        video.src = url;
        video.controls = true;
        video.autoplay = true;
        return video;
      }

      document.getElementById('nextBtn').addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % currentMedia.length;
        showSlideshow();
      });

      document.getElementById('prevBtn').addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + currentMedia.length) % currentMedia.length;
        showSlideshow();
      });

      document.getElementById('closeSlideshow').addEventListener('click', () => {
        slideshowOverlay.classList.add('hidden');
      });
    });