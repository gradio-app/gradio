//
//  UIImage+Extensions.swift
//  Gradio
//
//  Created by Dawood Khan on 3/7/19.
//  Copyright © 2019 Gradio. All rights reserved.
//

import UIKit

extension UIImage {
//    func resizeImage(_ dimension: CGFloat, opaque: Bool, contentMode: UIView.ContentMode = .scaleAspectFit) -> UIImage {
//        var width: CGFloat
//        var height: CGFloat
//        var newImage: UIImage
//
//        let size = self.size
//        let aspectRatio =  size.width/size.height
//
//        switch contentMode {
//        case .scaleAspectFit:
//            if aspectRatio > 1 {                            // Landscape image
//                width = dimension
//                height = dimension / aspectRatio
//            } else {                                        // Portrait image
//                height = dimension
//                width = dimension * aspectRatio
//            }
//
//        default:
//            fatalError("UIIMage.resizeToFit(): FATAL: Unimplemented ContentMode")
//        }
//
//        if #available(iOS 10.0, *) {
//            let renderFormat = UIGraphicsImageRendererFormat.default()
//            renderFormat.opaque = opaque
//            let renderer = UIGraphicsImageRenderer(size: CGSize(width: width, height: height), format: renderFormat)
//            newImage = renderer.image {
//                (context) in
//                self.draw(in: CGRect(x: 0, y: 0, width: width, height: height))
//            }
//        } else {
//            UIGraphicsBeginImageContextWithOptions(CGSize(width: width, height: height), opaque, 0)
//            self.draw(in: CGRect(x: 0, y: 0, width: width, height: height))
//            newImage = UIGraphicsGetImageFromCurrentImageContext()!
//            UIGraphicsEndImageContext()
//        }
//
//        return newImage
//    }
    
    func resizeImage(targetSize: CGSize) -> UIImage {
        let size = self.size
        
        let widthRatio  = targetSize.width  / size.width
        let heightRatio = targetSize.height / size.height
        
        // Figure out what our orientation is, and use that to form the rectangle
        var newSize: CGSize
        if(widthRatio > heightRatio) {
            newSize = CGSize(width: size.width * heightRatio, height: size.height * heightRatio)
        } else {
            newSize = CGSize(width: size.width * widthRatio,  height: size.height * widthRatio)
        }
        
        // This is the rect that we've calculated out and this is what is actually used below
        let rect = CGRect(x: 0, y: 0, width: newSize.width, height: newSize.height)
        
        // Actually do the resizing to the rect using the ImageContext stuff
        UIGraphicsBeginImageContextWithOptions(newSize, false, 1.0)
        self.draw(in: rect)
        let newImage = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()
        
        return newImage!
    }
}
