# Lambrk - Next-Generation Video Streaming Platform

A modern, dark-themed landing page for a next-generation video streaming platform built with Next.js, featuring fluid animations and responsive design.

## Features

- **Dark Theme Design**: Beautiful black/dark mode interface with subtle gradients and animations
- **Background Video**: Looping background video with smooth playback
- **Interactive Video Player**: Main video section with play/pause controls on hover/tap
- **Responsive Design**: Fully responsive and optimized for mobile devices
- **Fluid Animations**: Smooth animations powered by Framer Motion
- **Feature Showcase**: Highlights including 8K 60fps, Dolby Vision, Dolby Atmos, RAW, HDR, and more
- **Downloads Page**: Manage downloaded content with play/view/download functionality
- **Navigation**: Bottom navigation with Home, Aria (Gen AI), and Downloads links

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library for smooth transitions
- **React**: UI library

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
│   ├── downloads/
│   │   └── page.tsx          # Downloads page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── public/
│   └── video/                # Video assets
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
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
- Animated background video
- Feature badges with icons
- Main video showcase with play/pause controls
- Smooth scroll animations
- Parallax mouse movement effects

### Downloads Page
- List of downloaded content
- Play button for videos
- View button for images
- Download button for videos
- Responsive card layout

### Navigation
- **Home**: Scrolls to top on home page, navigates from other pages
- **Aria**: Links to aria.lambrk.com (Gen AI website)
- **Downloads**: Navigates to downloads page

## Video Assets

Place video files in the `public/video/` directory:
- Background video: `1536315-hd_1920_1080_30fps.mp4`
- Main showcase video: `7644958-uhd_4096_2160_24fps.mp4`

## Customization

### Colors
Edit `tailwind.config.js` to customize the color scheme.

### Animations
Modify animation variants in `app/page.tsx` to adjust timing and effects.

### Content
Update feature lists, descriptions, and download items in their respective page components.

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

Email: debarunlahiri2016@gmail.com

