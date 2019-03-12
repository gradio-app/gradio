//
//  SketchPadToImageViewController.swift
//  Gradio
//
//  Created by Dawood Khan on 3/9/19.
//  Copyright © 2019 Gradio. All rights reserved.
//

import UIKit

class SketchPadToImageViewController: UIViewController, UIGestureRecognizerDelegate {

    var titleImageView: UIImageView = UIImageView()
    var sketchPadInput: SketchPadInterface = SketchPadInterface(interfaceType: InterfaceType.Input)
    var outputImage: UIImageView = UIImageView()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.view.backgroundColor = UIColor.white
        titleImageView.image = UIImage(named: "Title Image")
        titleImageView.translatesAutoresizingMaskIntoConstraints = false
        self.view.addSubview(titleImageView)
        titleImageView.topAnchor.constraint(equalTo: self.view.topAnchor, constant: 10.0).isActive = true
        titleImageView.widthAnchor.constraint(equalTo: self.view.widthAnchor, multiplier: 0.5).isActive = true
        titleImageView.heightAnchor.constraint(equalTo: self.view.heightAnchor, multiplier: 0.08).isActive = true
        titleImageView.centerXAnchor.constraint(equalTo: self.view.centerXAnchor).isActive = true
        
        let stackView = UIStackView()
        stackView.translatesAutoresizingMaskIntoConstraints = false
        self.view.addSubview(stackView)
        stackView.distribution = .equalSpacing
        stackView.alignment = .fill
        stackView.axis = .vertical
        stackView.heightAnchor.constraint(equalTo: self.view.heightAnchor, multiplier: 0.8).isActive = true
        stackView.widthAnchor.constraint(equalTo: self.view.widthAnchor, multiplier: 0.8).isActive = true
        stackView.centerXAnchor.constraint(equalTo: self.view.centerXAnchor).isActive = true
        stackView.centerYAnchor.constraint(equalTo: self.view.centerYAnchor).isActive = true
        
        sketchPadInput.translatesAutoresizingMaskIntoConstraints = false
        sketchPadInput.backgroundColor = UIColor(red: 0.72, green: 0.72, blue: 0.72, alpha: 1.0)
        stackView.addArrangedSubview(sketchPadInput)
        sketchPadInput.heightAnchor.constraint(equalTo: stackView.heightAnchor, multiplier: 0.45).isActive = true
        sketchPadInput.widthAnchor.constraint(equalTo: stackView.widthAnchor).isActive = true
        
        outputImage.translatesAutoresizingMaskIntoConstraints = false
        outputImage.backgroundColor = UIColor(red: 0.72, green: 0.72, blue: 0.72, alpha: 1.0)
        stackView.addArrangedSubview(outputImage)
        outputImage.heightAnchor.constraint(equalTo: stackView.heightAnchor, multiplier: 0.45).isActive = true
        outputImage.widthAnchor.constraint(equalTo: stackView.widthAnchor).isActive = true
        
        //        let storyBoard: UIStoryboard = UIStoryboard(name: "Main", bundle: nil)
        //        cameraViewController = storyBoard.instantiateViewController(withIdentifier: "CameraViewController") as? CameraViewController
        //
        //        let tapGestureRecognizer = UITapGestureRecognizer(target: self, action: #selector(imageTapped(tapGestureRecognizer:)))
        //        preview.isUserInteractionEnabled = true
        //        preview.addGestureRecognizer(tapGestureRecognizer)
        //
        //        updatePreviewWithCapturedImage()
        //        setupWebSocket()
    }
}
