/**
 * Single source of truth for every indexable tool page.
 * Drives: the page UI, <head> tags, JSON-LD (WebPage, BreadcrumbList, HowTo,
 * FAQPage), the sitemap and the react-snap prerender list.
 *
 * Writing rules baked in here (for ranking): one primary keyword per page in
 * title/H1/URL, titles <= 60 chars, descriptions <= 160, genuinely different
 * copy per page (no doorway pages), every page links to its siblings.
 */

export const PAGES = [
  {
    path: '/',
    key: 'home',
    nav: 'Home',
    accepts: 'both',
    title: 'DownloadShorts: Instagram Reels & YouTube Downloader',
    description:
      'Free Instagram Reels and YouTube video downloader. Save Shorts and long videos in HD, cut YouTube clips or get MP3 audio. No login, no app, no watermark.',
    h1: 'Instagram Reels & YouTube Video Downloader',
    subtitle:
      'Paste a link and save Instagram Reels, YouTube Shorts or full-length YouTube videos in HD. Cut any part of a video into clips or grab the MP3. Free, no login.',
    placeholder: 'Paste an Instagram Reel or YouTube link here...',
    badge: 'Instagram + YouTube',
    steps: [
      { title: 'Copy the link', text: 'Open Instagram or YouTube, tap Share and copy the link of the video you want.' },
      { title: 'Paste it above', text: 'Paste the URL into the box. We detect the platform and load the video details in seconds.' },
      { title: 'Download or clip', text: 'Pick a quality, download the full video, extract the MP3, or cut just the part you need.' },
    ],
    benefits: [
      'Instagram Reels, YouTube Shorts and long YouTube videos in one tool',
      'HD MP4 up to 4K when the source offers it',
      'Cut YouTube videos into clips, or split a long video into equal parts',
      'MP3 audio extraction for reels and videos',
      'No account, no app, no browser extension',
      'Works on iPhone, Android, Windows and Mac',
    ],
    sections: [
      {
        h2: 'One downloader for Instagram and YouTube',
        paragraphs: [
          'DownloadShorts is a free online video downloader built for short-form and long-form video. Paste an Instagram Reel link to save it as an MP4, paste a YouTube Shorts link to keep a clip offline, or paste a regular YouTube video and choose the exact resolution you want.',
          'Everything runs in your browser and on our servers, so there is nothing to install. The same page works on a phone, a tablet and a desktop, and your downloads go straight to your device’s Downloads folder.',
        ],
      },
      {
        h2: 'Turn long YouTube videos into clips',
        paragraphs: [
          'Need thirty seconds from a two-hour podcast? Our YouTube clip tool lets you set a start and end time and download only that section, or split the whole video into equal parts of 30 seconds, 1 minute, 5 minutes and more. It is the fastest way to prepare clips for Reels, Shorts and WhatsApp status.',
        ],
      },
    ],
    faq: [
      { question: 'Is DownloadShorts free?', answer: 'Yes. DownloadShorts is completely free and does not require any subscription or registration.' },
      { question: 'Which links are supported?', answer: 'Instagram Reels and posts, YouTube Shorts, regular YouTube videos (youtube.com/watch and youtu.be links) and YouTube live replays.' },
      { question: 'Can I download only part of a YouTube video?', answer: 'Yes. Open the clip tool after pasting a YouTube link, choose a start and end time, or split the video into equal parts and download each one.' },
      { question: 'Can I download audio only?', answer: 'Yes. Every result has an Extract Audio (MP3) button that works for Instagram Reels and YouTube videos.' },
      { question: 'Do I need to log in?', answer: 'No. DownloadShorts works without creating an account, and you never have to enter your Instagram or Google password.' },
      { question: 'Can I use it on mobile?', answer: 'Yes. It works on Android, iPhone, tablets and desktop browsers. Files are saved to your Downloads folder or Files app.' },
    ],
    related: [
      '/instagram-reels-downloader',
      '/youtube-shorts-downloader',
      '/youtube-video-downloader',
      '/youtube-video-clipper',
      '/youtube-to-mp3',
      '/instagram-reel-audio-downloader',
    ],
  },

  {
    path: '/instagram-reels-downloader',
    key: 'instagram-reels',
    nav: 'Instagram Reels',
    accepts: 'instagram',
    title: 'Instagram Reels Downloader - Save Reels in HD Free',
    description:
      'Download Instagram Reels in HD for free. Paste the Reel link, save the MP4 to your phone or PC in seconds. No login, no app and no watermark added.',
    h1: 'Instagram Reels Downloader',
    subtitle:
      'Save any public Instagram Reel as an HD MP4 in a few seconds. Paste the link, tap download. No login, no app, no watermark added by us.',
    placeholder: 'Paste your Instagram Reel URL here...',
    badge: 'Instagram Reels',
    steps: [
      { title: 'Copy the Reel link', text: 'In the Instagram app open the Reel, tap the paper-plane Share icon and choose Copy link.' },
      { title: 'Paste the URL', text: 'Paste it into the box above. The Reel preview and details load automatically.' },
      { title: 'Download the MP4', text: 'Tap Download Video. The file is saved in the highest quality Instagram offers.' },
    ],
    benefits: [
      'Original-quality MP4 straight from Instagram',
      'Works for Reels and public video posts',
      'Hashtags shown so you can copy them in one tap',
      'Optional MP3 of the Reel’s audio',
      'No login and no Instagram password needed',
      'Fast on mobile data and Wi-Fi',
    ],
    sections: [
      {
        h2: 'How to download Instagram Reels on any device',
        paragraphs: [
          'Instagram does not give you a save-to-gallery button for other people’s Reels. DownloadShorts fills that gap: it reads the public link you paste, finds the video file Instagram serves for that Reel and hands it to your browser as a normal MP4 download.',
          'On iPhone the file lands in the Files app under Downloads; on Android it appears in your gallery or Downloads folder; on desktop it is saved by your browser. No additional software is needed.',
        ],
      },
      {
        h2: 'Private accounts and copyright',
        paragraphs: [
          'Only public Reels can be downloaded. Reels from private accounts are not accessible and we never ask for your Instagram login. Please download content only when you own it or have the creator’s permission, and credit the original creator when you repost.',
        ],
      },
    ],
    faq: [
      { question: 'How do I download an Instagram Reel?', answer: 'Copy the Reel link from Instagram, paste it into DownloadShorts and press Download Video. The MP4 is saved to your device.' },
      { question: 'Does the downloaded Reel have a watermark?', answer: 'DownloadShorts does not add any watermark. Instagram Reels are served without a download watermark.' },
      { question: 'Can I download Reels from a private account?', answer: 'No. Only public Reels can be downloaded. We never ask for your login details.' },
      { question: 'What quality will the Reel be?', answer: 'You get the highest-quality file Instagram provides for that Reel, usually 720p or 1080p vertical video.' },
      { question: 'Where is the Reel saved on my phone?', answer: 'On Android it is saved to your Downloads folder or gallery. On iPhone it is saved in the Files app under Downloads.' },
    ],
    related: ['/instagram-reel-audio-downloader', '/youtube-shorts-downloader', '/youtube-video-clipper', '/'],
  },

  {
    path: '/instagram-reel-audio-downloader',
    key: 'instagram-audio',
    nav: 'Reel Audio (MP3)',
    accepts: 'instagram',
    title: 'Instagram Reel Audio Downloader - Reel to MP3',
    description:
      'Extract audio from any public Instagram Reel and save it as an MP3. Free Reel to MP3 converter: paste the link, tap Extract Audio. No login required.',
    h1: 'Instagram Reel Audio Downloader',
    subtitle:
      'Turn an Instagram Reel into an MP3 file. Paste the Reel link and tap Extract Audio (MP3) on the result.',
    placeholder: 'Paste an Instagram Reel URL to extract its audio...',
    badge: 'Reel to MP3',
    steps: [
      { title: 'Copy the Reel link', text: 'Open the Reel with the sound you like, tap Share and copy the link.' },
      { title: 'Paste it above', text: 'Paste the URL and wait a moment while we load the Reel.' },
      { title: 'Extract Audio (MP3)', text: 'Tap Extract Audio (MP3). The soundtrack is converted and downloaded to your device.' },
    ],
    benefits: [
      'Reel to MP3 in one tap',
      'Good for saving trending sounds and voice-overs',
      'High-quality variable-bitrate MP3',
      'No app, no login',
      'Works on mobile and desktop',
      'Video download available from the same result',
    ],
    sections: [
      {
        h2: 'Save the sound from an Instagram Reel',
        paragraphs: [
          'Found a trending sound, a funny voice-over or a song you want to identify? Paste the Reel link and the audio is extracted from the video and converted to MP3 on our server, ready to play on any device or use as a ringtone or editing sample.',
          'Because the audio is cut from the Reel’s own video, it contains exactly what you hear in the Reel, including any voice over the music.',
        ],
      },
      {
        h2: 'Using Reel audio responsibly',
        paragraphs: [
          'Music and sounds in Reels are usually protected by copyright. Use extracted audio for personal listening, and get permission or a licence before using it in anything you publish or monetise.',
        ],
      },
    ],
    faq: [
      { question: 'How do I convert an Instagram Reel to MP3?', answer: 'Paste the Reel link above, wait for the preview and press Extract Audio (MP3).' },
      { question: 'Is the audio quality good?', answer: 'Yes. We encode the audio as a high-quality variable-bitrate MP3 from the best audio Instagram provides.' },
      { question: 'Can I get the original song instead of the Reel audio?', answer: 'We extract the soundtrack that plays in the Reel. If a song is mixed with a voice-over you will get the mix as heard in the Reel.' },
      { question: 'Is it legal to download audio from Reels?', answer: 'Personal listening is generally fine, but music is usually copyrighted. Get permission before publishing or monetising it.' },
    ],
    related: ['/instagram-reels-downloader', '/youtube-to-mp3', '/'],
  },

  {
    path: '/youtube-video-downloader',
    key: 'youtube-video',
    nav: 'YouTube Video',
    accepts: 'youtube',
    title: 'YouTube Video Downloader - HD MP4 up to 4K Free',
    description:
      'Free YouTube video downloader. Paste any YouTube link and save the video as MP4 in 1080p, 1440p or 4K with sound. No software, no signup, works on mobile.',
    h1: 'YouTube Video Downloader',
    subtitle:
      'Download long YouTube videos as MP4 with sound. Choose 360p up to 4K, or cut the exact part you need. Free, no signup.',
    placeholder: 'Paste a YouTube video link here...',
    badge: 'YouTube',
    steps: [
      { title: 'Copy the YouTube link', text: 'Copy the address from your browser, or tap Share → Copy link in the YouTube app.' },
      { title: 'Paste and choose quality', text: 'Paste the URL above, then pick a resolution from the list of available qualities.' },
      { title: 'Download the MP4', text: 'Press Download. Video and audio are merged into one MP4 that plays everywhere.' },
    ],
    benefits: [
      'Up to 4K / 2160p when the video offers it',
      'Video and audio merged into one compatible MP4 (H.264 + AAC)',
      'Quality picker shows only resolutions that really exist',
      'Works with youtube.com, m.youtube.com and youtu.be links',
      'Clip tool to download only part of a long video',
      'No toolbar, extension or desktop software',
    ],
    sections: [
      {
        h2: 'Download YouTube videos in the quality you choose',
        paragraphs: [
          'YouTube stores high-resolution video and audio as separate streams. DownloadShorts fetches both, merges them with FFmpeg and gives you a single MP4 with H.264 video and AAC audio, which plays on iPhone, Android, Windows, Mac, TVs and video editors without conversion.',
          'The quality list is built from the formats the video really offers, so you never pick a resolution that does not exist. Higher resolutions are bigger files and take longer to prepare, so for a quick save on mobile data 720p is a good balance.',
        ],
      },
      {
        h2: 'Only need a section of the video?',
        paragraphs: [
          'Use the clip tool that appears under the quality list to download a start-to-end section instead of the whole video, which is faster and saves storage. See our YouTube clip maker page for details.',
        ],
      },
    ],
    faq: [
      { question: 'How do I download a YouTube video?', answer: 'Copy the video link, paste it in the box above, choose a quality and press Download. The MP4 is saved to your device.' },
      { question: 'What is the maximum quality?', answer: 'Up to 4K (2160p) when the uploader provides it. The list shows exactly which resolutions are available for your video.' },
      { question: 'Does the video include sound?', answer: 'Yes. Video and audio are merged into a single MP4, so you get picture and sound together.' },
      { question: 'Why does a long video take a while to start downloading?', answer: 'For high resolutions we download and merge the video and audio streams first, then send you the finished file. Long 1080p and 4K videos can take a minute or more.' },
      { question: 'Is downloading YouTube videos legal?', answer: 'Download videos you own, that are in the public domain or Creative Commons, or that you have permission to save. Respect creators’ copyrights and YouTube’s terms.' },
    ],
    related: ['/youtube-video-clipper', '/youtube-shorts-downloader', '/youtube-to-mp3', '/'],
  },

  {
    path: '/youtube-shorts-downloader',
    key: 'youtube-shorts',
    nav: 'YouTube Shorts',
    accepts: 'youtube',
    title: 'YouTube Shorts Downloader - Save Shorts in HD',
    description:
      'Download YouTube Shorts as MP4 in HD, free and without an app. Paste the Shorts link, choose a quality and save the vertical video to your phone or PC.',
    h1: 'YouTube Shorts Downloader',
    subtitle:
      'Save any YouTube Short as a vertical HD MP4. Paste the Shorts link, pick a quality and download. No login, no watermark added.',
    placeholder: 'Paste a YouTube Shorts link here...',
    badge: 'YouTube Shorts',
    steps: [
      { title: 'Copy the Shorts link', text: 'In the YouTube app open the Short, tap Share and choose Copy link. It looks like youtube.com/shorts/…' },
      { title: 'Paste it above', text: 'Paste the link. We load the Short’s title, thumbnail and available qualities.' },
      { title: 'Download the Short', text: 'Pick a resolution and tap Download. The vertical MP4 is saved to your device.' },
    ],
    benefits: [
      'Vertical 9:16 MP4 in up to 1080p',
      'Accepts youtube.com/shorts links directly',
      'Video and sound merged into one file',
      'Get just the audio as MP3 if you only want the sound',
      'No app, no watermark added by us',
      'Fast: Shorts are small, so downloads start quickly',
    ],
    sections: [
      {
        h2: 'Download YouTube Shorts to your phone or PC',
        paragraphs: [
          'YouTube Shorts are vertical videos of up to three minutes. Unlike a normal video link, Shorts use the youtube.com/shorts/ address; DownloadShorts understands that format as well as the regular watch link, so you can paste whatever the Share button gives you.',
          'Downloaded Shorts are standard MP4 files, ready to reuse in your own edits, share in chats or keep for offline viewing.',
        ],
      },
      {
        h2: 'Reposting Shorts the right way',
        paragraphs: [
          'Always credit the original creator and check whether you have permission before you re-upload someone else’s Short. If you want only a segment of a longer video as a Short-sized clip, use our YouTube clip maker.',
        ],
      },
    ],
    faq: [
      { question: 'How do I download a YouTube Short?', answer: 'Copy the Short’s link from the Share menu, paste it above and press Download.' },
      { question: 'Do Shorts links work the same as video links?', answer: 'Yes. Both youtube.com/shorts/ID and regular watch links are supported.' },
      { question: 'What quality are downloaded Shorts?', answer: 'The list shows every resolution the Short offers, typically up to 1080p vertical.' },
      { question: 'Can I download only the sound of a Short?', answer: 'Yes. Use the Extract Audio (MP3) button on the result.' },
      { question: 'Can I turn a long video into Shorts-sized clips?', answer: 'Yes. Paste the long video link and use the clip maker to split it into 15, 30 or 60 second parts.' },
    ],
    related: ['/youtube-video-clipper', '/youtube-video-downloader', '/instagram-reels-downloader', '/'],
  },

  {
    path: '/youtube-video-clipper',
    key: 'youtube-clipper',
    nav: 'YouTube Clip Maker',
    accepts: 'youtube',
    title: 'YouTube Clip Maker - Cut Any Part of a Video Online',
    description:
      'Cut YouTube videos into clips online. Choose a start and end time or split a long video into equal parts, then download each clip as MP4. Free, no signup.',
    h1: 'YouTube Clip Maker',
    subtitle:
      'Cut any section out of a YouTube video, or split a long video into equal clips. Works with Shorts and full-length videos.',
    placeholder: 'Paste a YouTube link to start clipping...',
    badge: 'Clip Maker',
    steps: [
      { title: 'Paste the YouTube link', text: 'Paste a video or Shorts link. A clip tool appears under the video details.' },
      { title: 'Set start and end', text: 'Drag the sliders or type times like 1:30 and 2:15, or choose a part length to split the whole video.' },
      { title: 'Download the clip', text: 'Press Download clip. Only that section is processed and saved as an MP4.' },
    ],
    benefits: [
      'Frame-accurate cuts for clips up to 3 minutes',
      'Clips up to 10 minutes long',
      'Split a long video into 15 s, 30 s, 1 min, 5 min or custom parts',
      'Choose the quality of each clip',
      'Downloads only the section you pick, not the whole video',
      'Perfect for Reels, Shorts, TikTok and WhatsApp status',
    ],
    sections: [
      {
        h2: 'Cut YouTube videos into clips without editing software',
        paragraphs: [
          'Traditional clipping means downloading the whole video and trimming it in an editor. DownloadShorts cuts on the server: you give a start and end time, we fetch only that section from YouTube and return a small MP4, so even a 30-second moment from a three-hour stream is ready in moments.',
          'Short clips (up to three minutes) are cut precisely to your timestamps. Longer clips snap to the nearest keyframe so they finish much faster.',
        ],
      },
      {
        h2: 'Split a long video into equal parts',
        paragraphs: [
          'Pick a part length and we list every segment with its time range. Download the ones you want, for example the first 60 seconds of a lecture, every 30 seconds of a podcast, or 5-minute chapters of a documentary. Each part is processed independently, so you only wait for the clips you actually download.',
        ],
      },
    ],
    faq: [
      { question: 'How do I cut a YouTube video online?', answer: 'Paste the video link, set a start and end time in the clip tool and press Download clip.' },
      { question: 'What is the longest clip I can make?', answer: 'Clips can be up to 10 minutes long. For longer content, split the video into several parts.' },
      { question: 'How accurate are the cuts?', answer: 'Clips of up to 3 minutes are re-encoded at the cut points so they start and end exactly where you chose. Longer clips start at the nearest keyframe, usually within a couple of seconds.' },
      { question: 'Can I split a whole video into clips automatically?', answer: 'Yes. Choose a part length such as 30 seconds or 5 minutes and download each generated segment.' },
      { question: 'Does it work with YouTube Shorts?', answer: 'Yes. Shorts and regular videos are both supported.' },
    ],
    related: ['/youtube-video-downloader', '/youtube-shorts-downloader', '/youtube-to-mp3', '/'],
  },

  {
    path: '/youtube-to-mp3',
    key: 'youtube-mp3',
    nav: 'YouTube to MP3',
    accepts: 'youtube',
    title: 'YouTube to MP3 Converter - Free, High Quality',
    description:
      'Convert YouTube videos to MP3 online for free. Paste the link, press Extract Audio and save a high-quality MP3. No software, no signup, works on mobile.',
    h1: 'YouTube to MP3 Converter',
    subtitle:
      'Extract the audio of any YouTube video or Short as a high-quality MP3. Paste the link, then press Extract Audio (MP3).',
    placeholder: 'Paste a YouTube link to convert to MP3...',
    badge: 'YouTube to MP3',
    steps: [
      { title: 'Copy the YouTube link', text: 'Copy the video address from your browser or the Share menu in the app.' },
      { title: 'Paste it above', text: 'Paste the link and wait while we load the video details.' },
      { title: 'Extract Audio (MP3)', text: 'Press Extract Audio (MP3). The audio is converted and saved to your device.' },
    ],
    benefits: [
      'High-quality MP3 (variable bitrate, around 190 kbps)',
      'Works for songs, podcasts, lectures and Shorts',
      'Converts on our servers, nothing runs on your phone',
      'No account or software needed',
      'Download the full video from the same result',
      'Works on mobile and desktop',
    ],
    sections: [
      {
        h2: 'Convert YouTube videos to MP3',
        paragraphs: [
          'Listening to a lecture, podcast or live set offline is easier with an audio file. DownloadShorts takes the best audio stream YouTube offers for the video and encodes it as an MP3 that plays in any music app, car stereo or MP3 player.',
          'Conversion time depends on the length of the video: a typical song takes a few seconds, while a multi-hour podcast needs a little longer because the whole file is encoded before the download starts.',
        ],
      },
      {
        h2: 'Please respect copyright',
        paragraphs: [
          'Most music on YouTube is protected by copyright. Convert only content you own, content with a licence that allows it, or material you have permission to use, and support artists through official streaming and purchase options.',
        ],
      },
    ],
    faq: [
      { question: 'How do I convert a YouTube video to MP3?', answer: 'Paste the video link above and press Extract Audio (MP3) on the result.' },
      { question: 'What quality is the MP3?', answer: 'High-quality variable-bitrate MP3 (around 190 kbps) encoded from the best audio YouTube provides.' },
      { question: 'Is there a length limit?', answer: 'Very long videos take longer to convert. For multi-hour videos, consider cutting a section with the clip maker first.' },
      { question: 'Can I convert YouTube Shorts to MP3?', answer: 'Yes. Shorts links work exactly like regular video links.' },
      { question: 'Is it free?', answer: 'Yes, completely free with no registration.' },
    ],
    related: ['/youtube-video-downloader', '/youtube-video-clipper', '/instagram-reel-audio-downloader', '/'],
  },
];

export const PAGE_BY_PATH = Object.fromEntries(PAGES.map((p) => [p.path, p]));

export const toolPages = PAGES.filter((p) => p.path !== '/');
