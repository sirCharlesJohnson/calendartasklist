# 📱 Deploy Todo Calendar App to Your iPhone

## Option 1: Deploy to Vercel (Recommended)

### Quick Deploy:
1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy from your project directory**:
   ```bash
   cd todo-calendar-app
   vercel
   ```

3. **Follow the prompts**:
   - Link to existing project? **No**
   - Project name: **todo-calendar-app** (or your choice)
   - Directory: **./** (current directory)
   - Override settings? **No**

4. **Your app will be live** at a URL like `https://todo-calendar-app-xxx.vercel.app`

### Set up Supabase for Production:
1. **Update environment variables** in Vercel dashboard:
   - Go to your project in Vercel dashboard
   - Go to Settings → Environment Variables
   - Add:
     - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key

2. **Redeploy** after adding environment variables

## Option 2: Deploy to Netlify

### Quick Deploy:
1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `out` folder (if using static export)
   - Or connect your GitHub repository

3. **Set environment variables** in Netlify dashboard

## 📱 Add to iPhone Home Screen

### Method 1: Direct URL
1. **Open Safari** on your iPhone
2. **Navigate** to your deployed app URL
3. **Tap the Share button** (square with arrow)
4. **Tap "Add to Home Screen"**
5. **Customize** the name and icon
6. **Tap "Add"**

### Method 2: PWA Installation
1. **Open the app** in Safari
2. **Look for the install prompt** (if supported)
3. **Tap "Install"** when prompted
4. **The app will appear** on your home screen

## 🔧 Mobile Optimizations Included

✅ **Responsive Design** - Works on all screen sizes
✅ **Touch-Friendly** - Optimized for touch interactions
✅ **PWA Support** - Can be installed as an app
✅ **Mobile-First** - Designed for mobile devices
✅ **Fast Loading** - Optimized for mobile networks
✅ **Offline Support** - Works without internet (basic functionality)

## 🚀 Features for Mobile

- **Drag & Drop** - Touch-friendly drag and drop
- **Swipe Gestures** - Natural mobile interactions
- **Responsive Calendar** - Fits perfectly on mobile screens
- **Touch Targets** - All buttons are finger-friendly
- **Fast Performance** - Optimized for mobile devices

## 🔒 Security Notes

- **HTTPS Required** - PWA features only work over HTTPS
- **Environment Variables** - Keep your Supabase keys secure
- **CORS Settings** - Configure Supabase for your domain

## 📊 Performance Tips

- **Enable Compression** - Vercel/Netlify handle this automatically
- **Optimize Images** - Use WebP format when possible
- **Minimize Bundle Size** - Next.js handles this automatically
- **Use CDN** - Vercel/Netlify provide global CDN

## 🐛 Troubleshooting

### App Not Installing:
- Ensure you're using HTTPS
- Check that the manifest.json is accessible
- Verify PWA requirements are met

### Supabase Not Working:
- Check environment variables are set correctly
- Verify CORS settings in Supabase
- Check network connectivity

### Performance Issues:
- Clear browser cache
- Check network speed
- Optimize images and assets

## 🎉 You're All Set!

Your Todo Calendar App is now ready for mobile use! The app will work great on your iPhone with all the features you built, including drag & drop, priority management, and real-time sync with Supabase.

