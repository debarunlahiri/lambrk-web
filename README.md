# Lambrk - Next-Generation Video Streaming Platform

A modern, dark-themed video streaming platform built with Next.js, featuring multiple content types (Videos, Bitz, Posts), a custom YouTube-like video player, authentication system, comments, playlists, and more.

**Website**: [lambrk.com](https://lambrk.com)

## Features

### Core Features
- **Dark Theme Design**: Beautiful black/dark mode interface with subtle gradients and animations
- **Multi-Content Platform**: Support for Videos, Bitz (short vertical videos), and Posts
- **Custom Video Player**: YouTube-like custom video player with quality selector (4K, 2K, HD, 720p, 480p, 360p, Auto)
- **Video Watch Page**: Full-featured video detail page with descriptions, comments, and interactions
- **Bitz Feed**: Vertical video feed with snap scrolling, keyboard navigation (arrow keys), and interactive controls
- **Posts Feed**: Social media-style posts with images, likes, dislikes, comments, and shares
- **Trending Page**: Dedicated page showcasing trending videos, bits, and posts
- **Authentication System**: User login and signup with email/password and Google OAuth support
- **Comments System**: Interactive comments with like/dislike functionality and counters
- **Playlist Management**: Save videos to playlists, create new playlists (public/private), and manage "Watch Later"
- **Share Functionality**: Share content via native share API, social media, email, or copy link with timestamp
- **Subscribe System**: Subscribe/unsubscribe to channels with authentication
- **Responsive Design**: Fully responsive and optimized for mobile devices
- **Fluid Animations**: Smooth animations powered by Framer Motion
- **Downloads Page**: Manage downloaded content with play/view/download functionality
- **Navigation**: Bottom navigation with Home, Aria (Gen AI), and Downloads links

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library for smooth transitions
- **React 18**: UI library
- **Vercel Analytics**: Analytics integration

### Key Dependencies
- `next`: ^14.0.0
- `react`: ^18.2.0
- `react-dom`: ^18.2.0
- `framer-motion`: ^10.16.4
- `@vercel/analytics`: ^1.1.1
- `typescript`: ^5.0.0
- `tailwindcss`: ^3.3.0

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lambrk-web
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
lambrk-web/
├── app/
│   ├── bits/
│   │   └── page.tsx               # Bitz page (vertical video feed)
│   ├── components/
│   │   ├── BottomNavigation.tsx   # Bottom navigation component
│   │   ├── CustomVideoPlayer.tsx  # Custom video player component
│   │   ├── Header.tsx             # Header component with search and menu
│   │   └── Sidebar.tsx            # Sidebar navigation component
│   ├── constants/
│   │   └── content.ts             # Content data (videos, bits, posts)
│   ├── contexts/
│   │   └── AuthContext.tsx        # Authentication context provider
│   ├── downloads/
│   │   └── page.tsx               # Downloads page
│   ├── login/
│   │   └── page.tsx               # Login page
│   ├── posts/
│   │   ├── [id]/                  # Dynamic post route
│   │   ├── detail/
│   │   │   └── page.tsx           # Post detail page
│   │   └── page.tsx               # Posts feed page
│   ├── signup/
│   │   └── page.tsx               # Signup page
│   ├── trending/
│   │   └── page.tsx               # Trending content page
│   ├── watch/
│   │   └── page.tsx               # Video watch/detail page
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout with AuthProvider
│   └── page.tsx                   # Home page
├── public/
│   ├── image/                     # Image assets
│   └── video/                     # Video assets
├── .gitignore
├── LICENSE
├── next.config.js
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
└── tsconfig.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features Breakdown

### Home Page
- Unified feed displaying Videos, Bitz, and Posts
- Shuffled content on each page load for variety
- Video thumbnails with hover-to-play preview
- Responsive grid layout (1-4 columns based on screen size)
- Channel avatars and metadata (views, time)
- "View All" links for Bitz and Posts sections
- Smooth animations with Framer Motion
- Conditional sidebar menus based on authentication status
- Account dropdown with user info and logout

### Bitz Page
- Vertical video feed
- Snap scrolling (one video per viewport)
- Keyboard navigation (Arrow Up/Down to navigate)
- Auto-play current video in viewport
- Pause previous video when scrolling
- Like/dislike buttons with counters
- Comments and share functionality
- Save to favorites
- Responsive design with different sizes for various screen resolutions
- Full-screen vertical video experience

### Posts Page
- Social media-style feed layout
- Post cards with author information
- Image support for posts
- Like/dislike functionality with state management
- Comments counter and link to detail page
- Share functionality (native share API or clipboard fallback)
- Save/bookmark button
- Responsive centered layout (max-width for readability)
- Smooth scroll animations

### Trending Page
- Dedicated page for trending content
- Separate sections for Trending Videos, Trending Bitz, and Trending Posts
- Trending badges on content items
- Same interaction features as main pages
- Links to full content pages

### Watch Page
- **Custom Video Player**: 
  - Play/pause controls
  - Progress bar with scrubbing
  - Volume control with horizontal slider
  - Fullscreen support
  - Quality selector (4K, 2K, HD, 720p, 480p, 360p, Auto)
  - Auto-hiding controls
  - Timestamp support in URL
- **Video Information**: Title, views, upload date, channel info
- **Like/Dislike**: Video engagement buttons (requires authentication)
- **Subscribe Button**: Subscribe/unsubscribe to channels (requires authentication)
- **Share Menu**: 
  - Copy link
  - Copy link with current timestamp
  - Share via native share API
  - Share to Twitter, Facebook, Reddit
  - Share via email
- **Playlist Management**:
  - Save to playlist button
  - "Watch Later" always at top
  - Create new playlists (public/private)
  - Add videos to existing playlists
- **Comments Section**:
  - Add comments (requires authentication)
  - Like/dislike comments with counters
  - Comment timestamps
- **Description**: Expandable video description
- **Related Videos**: Sidebar with related content

### Authentication
- **Login Page**: Email/password login with Google OAuth option
- **Signup Page**: Name, username, email, password with Google signup option
- **Auth Context**: Global authentication state management
- **Protected Features**: Like, dislike, comment, save to playlist, subscribe require authentication
- **Conditional UI**: Sidebar menus (Liked Videos, Watch Later, Your Videos, History, Subscriptions) shown only when logged in

### Downloads Page
- List of downloaded content
- Play button for videos
- View button for images
- Download button for videos
- Responsive card layout

### Navigation Components

#### Header
- Search functionality
- Sidebar toggle button
- User account dropdown (when authenticated)
- Responsive design

#### Sidebar
- Navigation links (Home, Trending, etc.)
- Conditional menus based on authentication:
  - Liked Videos
  - Watch Later
  - Your Videos
  - History
  - Subscriptions
- Collapsible on mobile/tablet

#### Bottom Navigation
- **Home**: Scrolls to top on home page, navigates from other pages
- **Aria**: Links to aria.lambrk.com (Gen AI website)
- **Downloads**: Navigates to downloads page
- Fixed at bottom for easy mobile access

## Content Management

### Video Assets
Place video files in the `public/video/` directory. Videos are referenced in `app/constants/content.ts`.

### Image Assets
Place image files in the `public/image/` directory. Images are used for post thumbnails and backgrounds.

### Content Configuration
Content data (videos, bits, posts) is managed in `app/constants/content.ts`. This includes:
- Video metadata (title, channel, views, duration, etc.)
- Bitz metadata (title, channel, views, likes, comments, etc.)
- Posts metadata (title, author, content, image, likes, dislikes, comments, shares, etc.)
- Trending content arrays

## Customization

### Colors
Edit `tailwind.config.js` to customize the color scheme.

### Animations
Modify animation variants in `app/page.tsx` to adjust timing and effects.

### Content
Update feature lists, descriptions, and download items in their respective page components.

### Video Player
Customize video player controls, quality options, and behavior in `app/components/CustomVideoPlayer.tsx`.

### Bitz Feed
Modify the vertical video feed behavior, keyboard navigation, and interactions in `app/bits/page.tsx`.

### Posts Feed
Customize post layout, interactions, and styling in `app/posts/page.tsx` and `app/posts/detail/page.tsx`.

### Authentication
Modify authentication logic and user management in `app/contexts/AuthContext.tsx`.

### Content Data
Update content arrays, add new videos/bits/posts, or modify metadata in `app/constants/content.ts`.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License

Copyright (c) 2024 Lambrk

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Contact

- **Website**: [lambrk.com](https://lambrk.com)
- **Email**: debarunlahiri2016@gmail.com

