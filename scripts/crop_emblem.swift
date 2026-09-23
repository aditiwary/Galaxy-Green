import Foundation
import CoreGraphics
import ImageIO

guard let imageSource = CGImageSourceCreateWithURL(URL(fileURLWithPath: "public/galaxy-green-logo.jpg") as CFURL, nil),
      let cgImage = CGImageSourceCreateImageAtIndex(imageSource, 0, nil) else {
    print("Failed to load image")
    exit(1)
}

let width = cgImage.width
let height = cgImage.height

// Perfect emblem bounding square
let cropSize: CGFloat = 560
let originX: CGFloat = (CGFloat(width) - cropSize) / 2.0 // 232
let originY: CGFloat = 70

let cropRect = CGRect(x: originX, y: originY, width: cropSize, height: cropSize)
guard let cropped = cgImage.cropping(to: cropRect) else {
    print("Failed to crop")
    exit(1)
}

func saveImage(_ image: CGImage, to path: String, format: String = "public.png") {
    let url = URL(fileURLWithPath: path) as CFURL
    guard let destination = CGImageDestinationCreateWithURL(url, format as CFString, 1, nil) else {
        print("Failed to create destination for \(path)")
        return
    }
    CGImageDestinationAddImage(destination, image, nil)
    if CGImageDestinationFinalize(destination) {
        print("Saved: \(path)")
    } else {
        print("Failed to save: \(path)")
    }
}

func resizeImage(_ image: CGImage, width: Int, height: Int) -> CGImage? {
    let bitsPerComponent = 8
    let bytesPerRow = width * 4
    let colorSpace = CGColorSpaceCreateDeviceRGB()
    let bitmapInfo = CGImageAlphaInfo.premultipliedLast.rawValue | CGBitmapInfo.byteOrder32Big.rawValue
    
    guard let context = CGContext(data: nil,
                                  width: width,
                                  height: height,
                                  bitsPerComponent: bitsPerComponent,
                                  bytesPerRow: bytesPerRow,
                                  space: colorSpace,
                                  bitmapInfo: bitmapInfo) else {
        return nil
    }
    
    context.interpolationQuality = .high
    context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
    return context.makeImage()
}

// 1. Save high-res emblem JPG & PNG
saveImage(cropped, to: "public/galaxy-green-emblem.jpg", format: "public.jpeg")
saveImage(cropped, to: "public/galaxy-green-emblem.png", format: "public.png")

// 2. Save Favicon & App Icons
if let icon192 = resizeImage(cropped, width: 192, height: 192) {
    saveImage(icon192, to: "public/android-chrome-192x192.png", format: "public.png")
}

if let icon512 = resizeImage(cropped, width: 512, height: 512) {
    saveImage(icon512, to: "public/android-chrome-512x512.png", format: "public.png")
}

if let icon180 = resizeImage(cropped, width: 180, height: 180) {
    saveImage(icon180, to: "public/apple-touch-icon.png", format: "public.png")
}

if let icon64 = resizeImage(cropped, width: 64, height: 64) {
    saveImage(icon64, to: "public/favicon-64x64.png", format: "public.png")
}

if let icon32 = resizeImage(cropped, width: 32, height: 32) {
    saveImage(icon32, to: "public/favicon-32x32.png", format: "public.png")
}

print("All emblem and icon assets generated successfully!")
