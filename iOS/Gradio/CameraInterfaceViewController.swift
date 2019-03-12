//
//  CameraInterfaceViewController.swift
//  Gradio
//
//  Created by Dawood Khan on 3/5/19.
//  Copyright © 2019 Gradio. All rights reserved.
//

import UIKit
import Photos
import Starscream

class CameraInterfaceViewController: UIViewController, WebSocketDelegate {
    
    var titleImageView: UIImageView = UIImageView()
    var cameraViewController: CameraViewController?
    var preview: UIImageView = UIImageView()
    var outputTextView: UITextView = UITextView()
    var socket: WebSocket = WebSocket(url: URL(string: "ws://c3f3ea66.ngrok.io")!)
    
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
        
        let tapForCameraImage = UIImage(named: "TapForCamera")
        preview = UIImageView(image: tapForCameraImage)
        preview.translatesAutoresizingMaskIntoConstraints = false
        preview.contentMode = .scaleAspectFit
        stackView.addArrangedSubview(preview)
        preview.heightAnchor.constraint(equalTo: stackView.heightAnchor, multiplier: 0.45).isActive = true
        preview.widthAnchor.constraint(equalTo: stackView.widthAnchor).isActive = true
        
        outputTextView = UITextView()
        outputTextView.translatesAutoresizingMaskIntoConstraints = false
        outputTextView.backgroundColor = UIColor(red: 0.72, green: 0.72, blue: 0.72, alpha: 1.0)
        outputTextView.isEditable = false
        outputTextView.text = "OUTPUT"
        outputTextView.textColor = UIColor.darkGray
        outputTextView.font = UIFont(name: "ArialMT", size: 24)
        stackView.addArrangedSubview(outputTextView)
        outputTextView.heightAnchor.constraint(equalTo: stackView.heightAnchor, multiplier: 0.45).isActive = true
        outputTextView.widthAnchor.constraint(equalTo: stackView.widthAnchor).isActive = true

        let storyBoard: UIStoryboard = UIStoryboard(name: "Main", bundle: nil)
        cameraViewController = storyBoard.instantiateViewController(withIdentifier: "CameraViewController") as? CameraViewController
        
        let tapGestureRecognizer = UITapGestureRecognizer(target: self, action: #selector(imageTapped(tapGestureRecognizer:)))
        preview.isUserInteractionEnabled = true
        preview.addGestureRecognizer(tapGestureRecognizer)
        
        updatePreviewWithCapturedImage()
        setupWebSocket()
    }

    @objc func imageTapped(tapGestureRecognizer: UITapGestureRecognizer) {
//        let cameraInterfaceViewController = CameraInterfaceViewController()
//        self.navigationController?.pushViewController(cameraInterfaceViewController, animated: true)
        guard let cameraInterfaceViewController = cameraViewController else { return }
        self.present(cameraInterfaceViewController, animated: true, completion: nil)
    }
    
    func updatePreviewWithCapturedImage() {
        guard let cameraViewController = cameraViewController else { return }
        cameraViewController.imageCaptureCompletionBlock = { image in
            DispatchQueue.main.async {
                self.preview.image = image
                self.preview.setNeedsDisplay()
                self.preview.setNeedsLayout()
            }
            let resizedImage = image.resizeImage(targetSize: CGSize(width: 360, height: 360))
            let imageData: NSData = resizedImage.pngData()! as NSData
            let strBase64 = imageData.base64EncodedString(options: .lineLength64Characters)
            let fullBase64String = "data:image/png;base64,\(strBase64))"
            self.socket.write(string: fullBase64String)

        }
    }
    
    func setupWebSocket() {
        socket.delegate = self
        socket.connect()
    }
    
    func websocketDidConnect(socket: WebSocketClient) {
        print("Web Socket Connected!")
    }
    
    func websocketDidDisconnect(socket: WebSocketClient, error: Error?) {
        print("Web Socket Disconnected: ", error.debugDescription)
    }
    
    func websocketDidReceiveMessage(socket: WebSocketClient, text: String) {
        print("Web Socket received message!")
        outputTextView.text = "Text Recieved: " + text
    }
    
    func websocketDidReceiveData(socket: WebSocketClient, data: Data) {
        print("Web Socket received data!")
        outputTextView.text = "Data Recieved: " + data.base64EncodedString()
    }
}
