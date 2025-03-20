const folderList = document.getElementById('folderList');
const imageGrid = document.getElementById('imageGrid');
const grid = document.getElementById('grid');
const backBtn = document.getElementById('backBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const slideshowOverlay = document.getElementById('slideshowOverlay');
const slideshowContent = document.getElementById('slideshowContent');
const filename = document.getElementById('imageFilename');
const sortFolders = document.getElementById('sortFolders'); // Reference to the sort dropdown
let currentIndex = 0;
let currentMedia = [];

// Generate buttons for cosplayer data dynamically
function generateButtons() {
  const dataDir = 'data/';
  const fileList = ['haneame.json', 'fantasyfactory.json', 'Aqua水淼.json', '霜月Shimo.json', 'doujin.json']; // Add your file names here

  const cosplayerList = document.getElementById('cosplayer-list');
  cosplayerList.innerHTML = ''; // Clear any existing buttons

  fileList.forEach(file => {
    const cosplayerName = file.replace('.json', '');
    const button = document.createElement('button');
    button.id = `${cosplayerName}Btn`;
    button.className = 'cosplayerButton w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded';
    button.textContent = cosplayerName;

    button.addEventListener('click', () => loadCosplayer(`${dataDir}${file}`));

    const listItem = document.createElement('li');
    listItem.appendChild(button);
    cosplayerList.appendChild(listItem);
  });
}

// Initial call to generate the cosplayer buttons
generateButtons();

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
// Function to load cosplayer data from JSON file
function loadCosplayer(jsonFile) {
  const cachedData = localStorage.getItem(jsonFile);
  if (cachedData) {
    const jsonData = JSON.parse(cachedData);
    populateFolders(jsonData);
    setupSortListener(jsonData); // Setup sorting options after loading data
    return;
  }

  fetch(jsonFile)

    .then(response => response.json())
    .then(jsonData => {
      localStorage.setItem(jsonFile, JSON.stringify(jsonData));

      populateFolders(jsonData);
      setupSortListener(jsonData); // Setup sorting options after loading data
    })
    .catch(error => console.error('Error loading JSON:', error));
}

// Function to populate folder list from JSON data
function populateFolders(jsonData) {
  folderList.innerHTML = ''; // Hapus folder sebelumnya
  folderList.classList.remove('hidden');
  imageGrid.classList.add('hidden');

  jsonData.folders.forEach(folder => {
    const folderDiv = document.createElement('div');
    folderDiv.classList.add('bg-gray-700', 'p-4', 'rounded-lg', 'cursor-pointer', 'hover:bg-gray-600', 'flex', 'flex-col', 'items-center');

    // Ambil gambar pertama jika tersedia dan bersihkan teks tambahan
    let firstImage = jsonData.images[folder] ? jsonData.images[folder][0] : null;
    if (firstImage) {
      firstImage = firstImage.split(" ")[0]; // Hanya ambil URL tanpa tambahan teks

      const imgElement = document.createElement('img');
      imgElement.src = firstImage;
      imgElement.alt = folder;
      imgElement.classList.add('w-full', 'h-40', 'object-cover', 'rounded-md', 'mb-2');
      folderDiv.appendChild(imgElement);
    }

    // Tambahkan teks nama folder
    const folderText = document.createElement('p');
    folderText.innerText = folder;
    folderText.classList.add('text-center', 'text-white', 'font-medium');
    folderDiv.appendChild(folderText);

    // Tambahkan event klik
    folderDiv.addEventListener('click', () => showMedia(folder, jsonData));

    folderList.appendChild(folderDiv);
  });
}



// Function to handle sorting options
function setupSortListener(jsonData) {
  sortFolders.addEventListener('change', (event) => {
    const sortOption = event.target.value;
    let sortedFolders = [...jsonData.folders]; // Salin data folders

    // Sorting berdasarkan opsi yang dipilih
    if (sortOption === 'asc') {
      sortedFolders.sort(); // Urutkan A-Z
    } else if (sortOption === 'desc') {
      sortedFolders.sort().reverse(); // Urutkan Z-A
    } else if (sortOption === 'newest') {
      sortedFolders = [...jsonData.folders].reverse(); // Terbaru (urutan JSON dibalik)
    } else if (sortOption === 'oldest') {
      sortedFolders = [...jsonData.folders]; // Terlama (sesuai urutan JSON asli)
    }

    // Hapus daftar lama dan tambahkan yang baru
    folderList.innerHTML = '';
    sortedFolders.forEach(folder => {
      const folderDiv = document.createElement('div');
      folderDiv.classList.add('bg-gray-700', 'p-4', 'rounded-lg', 'cursor-pointer', 'hover:bg-gray-600', 'flex', 'flex-col', 'items-center');

      // Ambil gambar pertama jika tersedia dan bersihkan teks tambahan
      let firstImage = jsonData.images[folder] ? jsonData.images[folder][0] : null;
      if (firstImage) {
        firstImage = firstImage.split(" ")[0]; // Hanya ambil URL tanpa tambahan teks

        const imgElement = document.createElement('img');
        imgElement.src = firstImage;
        imgElement.alt = folder;
        imgElement.classList.add('w-full', 'h-40', 'object-cover', 'rounded-md', 'mb-2');
        folderDiv.appendChild(imgElement);
      }

      // Tambahkan teks nama folder
      const folderText = document.createElement('p');
      folderText.innerText = folder;
      folderText.classList.add('text-center', 'text-white', 'font-medium');
      folderDiv.appendChild(folderText);

      // Tambahkan event klik
      folderDiv.addEventListener('click', () => showMedia(folder, jsonData));

      folderList.appendChild(folderDiv);
    });
  });
}



// Function to display media for a selected folder
function showMedia(folder, jsonData) {
  folderList.classList.add('hidden');
  imageGrid.classList.remove('hidden');

  backBtn.addEventListener('click', () => {
    folderList.classList.remove('hidden');
    imageGrid.classList.add('hidden');
  });

  currentMedia = jsonData.images[folder];
  renderMediaGrid(currentMedia);
}

// Function to render media grid
function renderMediaGrid(media) {
  grid.innerHTML = ''; // Clear existing content

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
      mediaElement.dataset.originalUrl = url; // Store original URL for toggling
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

document.addEventListener("DOMContentLoaded", () => {
  const toggleAllBtn = document.createElement("button");
  toggleAllBtn.id = "toggleAllBtn";
  toggleAllBtn.classList.add("bg-red-500", "p-2", "rounded", "mb-4", "text-white");
  toggleAllBtn.textContent = "Change to MD";
  
  document.getElementById("imageGrid").insertBefore(toggleAllBtn, document.getElementById("grid"));
  
  toggleAllBtn.addEventListener("click", () => {
    const images = document.querySelectorAll("#grid img");
    let isCurrentlyMD = [...images].some(img => img.src.includes(".md."));
    
    images.forEach(img => {
      let originalUrl = img.dataset.originalUrl;
      if (isCurrentlyMD) {
        img.src = originalUrl.replace(/\.md(\.[a-zA-Z0-9]+)$/, "$1");
        img.dataset.originalUrl = img.src;
      } else {
        img.src = originalUrl.replace(/(\.[a-zA-Z0-9]+)$/, ".md$1");
        img.dataset.originalUrl = img.src;
      }
    });
    
    toggleAllBtn.textContent = isCurrentlyMD ? "Change to MD" : "Change to HD";
    
    if (window.currentFolder) {
      renderMediaGrid(window.currentFolder); // Refresh images based on the current folder
    }
  });
});


// Event listener for shuffle button
shuffleBtn.addEventListener('click', () => {
  shuffleArray(currentMedia);
  renderMediaGrid(currentMedia);
});


// Function to parse media data and extract URL, title, and type
function parseMediaData(mediaData) {
  const regex = /(?<url>https:\/\/[^\s]+)(?:\s\[(?<title>.+?)\])?(?:\s\((?<type>image|video)\))?/;
  const match = mediaData.match(regex);
  return {
    url: match ? match.groups.url : '',
    title: match && match.groups.title ? match.groups.title : null,
    type: match && match.groups.type ? match.groups.type : 'image',
  };
}

// Function to open slideshow with selected media
function openSlideshow(index, media) {
  currentIndex = index;
  currentMedia = media;
  showSlideshow();
}

// Function to show the current media in slideshow mode
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

// Function to create a video element
function createVideoElement(url) {
  const video = document.createElement('video');
  video.classList.add('max-w-full', 'rounded-lg');
  video.src = url;
  video.controls = true;
  video.autoplay = true;
  return video;
}

// Next/Prev buttons for slideshow navigation
document.getElementById('nextBtn').addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % currentMedia.length;
  showSlideshow();
});

document.getElementById('prevBtn').addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + currentMedia.length) % currentMedia.length;
  showSlideshow();
});

// Close slideshow overlay
document.getElementById('closeSlideshow').addEventListener('click', () => {
  slideshowOverlay.classList.add('hidden');
});
