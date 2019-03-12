//
//  SketchPadInterface.swift
//  Gradio
//
//  Created by Dawood Khan on 3/9/19.
//  Copyright © 2019 Gradio. All rights reserved.
//

import UIKit

class SketchPadInterface: UIView {

    let interfaceType: InterfaceType?
    var mainImageView: UIImageView = UIImageView()
    var tempImageView: UIImageView = UIImageView()
    
    var lastPoint = CGPoint.zero
    var color = UIColor.black
    var brushWidth: CGFloat = 10.0
    var opacity: CGFloat = 1.0
    var swiped = false
    
    init(interfaceType: InterfaceType) {
        self.interfaceType = interfaceType
        super.init(frame: CGRect.zero)
        setupView()
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    func setupView() {
        self.addSubview(mainImageView)
//        self.isExclusiveTouch = true
        mainImageView.translatesAutoresizingMaskIntoConstraints = false
        mainImageView.topAnchor.constraint(equalTo: self.topAnchor).isActive = true
        mainImageView.bottomAnchor.constraint(equalTo: self.bottomAnchor).isActive = true
        mainImageView.leadingAnchor.constraint(equalTo: self.leadingAnchor).isActive = true
        mainImageView.trailingAnchor.constraint(equalTo: self.trailingAnchor).isActive = true
        
        self.addSubview(tempImageView)
        tempImageView.translatesAutoresizingMaskIntoConstraints = false
        tempImageView.topAnchor.constraint(equalTo: self.topAnchor).isActive = true
        tempImageView.bottomAnchor.constraint(equalTo: self.bottomAnchor).isActive = true
        tempImageView.leadingAnchor.constraint(equalTo: self.leadingAnchor).isActive = true
        tempImageView.trailingAnchor.constraint(equalTo: self.trailingAnchor).isActive = true

    }
    
    func drawLine(from fromPoint: CGPoint, to toPoint: CGPoint) {
        UIGraphicsBeginImageContext(self.frame.size)
        guard let context = UIGraphicsGetCurrentContext() else {
            return
        }
        tempImageView.image?.draw(in: self.bounds)
        
        context.move(to: fromPoint)
        context.addLine(to: toPoint)
        
        context.setLineCap(.round)
        context.setBlendMode(.normal)
        context.setLineWidth(brushWidth)
        context.setStrokeColor(color.cgColor)
        
        context.strokePath()
        
        tempImageView.image = UIGraphicsGetImageFromCurrentImageContext()
        tempImageView.alpha = opacity
        
        UIGraphicsEndImageContext()
    }
    
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else {
            return
        }
        swiped = false
        lastPoint = touch.location(in: self)
    }
    
    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else {
            return
        }
        swiped = true
        let currentPoint = touch.location(in: self)
        drawLine(from: lastPoint, to: currentPoint)
        
        lastPoint = currentPoint
    }
    
    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        if !swiped {
            // draw a single point
            drawLine(from: lastPoint, to: lastPoint)
        }
        
        // Merge tempImageView into mainImageView
        UIGraphicsBeginImageContext(mainImageView.frame.size)
        mainImageView.image?.draw(in: self.bounds, blendMode: .normal, alpha: 1.0)
        tempImageView.image?.draw(in: self.bounds, blendMode: .normal, alpha: opacity)
        mainImageView.image = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()
        
        tempImageView.image = nil
    }
}

// MARK: - SettingsViewControllerDelegate

//extension SketchPadInterface: SettingsViewControllerDelegate {
//    func settingsViewControllerFinished(_ settingsViewController: SettingsViewController) {
//        brushWidth = settingsViewController.brush
//        opacity = settingsViewController.opacity
//        color = UIColor(red: settingsViewController.red,
//                        green: settingsViewController.green,
//                        blue: settingsViewController.blue,
//                        alpha: opacity)
//        dismiss(animated: true)
//    }
