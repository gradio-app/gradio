//
//  TextToTextViewController.swift
//  Gradio
//
//  Created by Dawood Khan on 3/9/19.
//  Copyright © 2019 Gradio. All rights reserved.
//

import UIKit
import Starscream

class TextToTextViewController: UIViewController, WebSocketDelegate {

    var titleImageView: UIImageView = UIImageView()
    var inputTextView: TextInterface = TextInterface(interfaceType: InterfaceType.Input)
    var outputTextView: TextInterface = TextInterface(interfaceType: InterfaceType.Output)
    var socket: WebSocket = WebSocket(url: URL(string: "ws://c3f3ea66.ngrok.io")!)
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.view.backgroundColor = UIColor.white
        
        let tap: UITapGestureRecognizer = UITapGestureRecognizer(target: self, action: #selector(dismissKeyboard))
        self.view.addGestureRecognizer(tap)
        
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
    
        inputTextView.translatesAutoresizingMaskIntoConstraints = false
        inputTextView.backgroundColor = UIColor(red: 0.72, green: 0.72, blue: 0.72, alpha: 1.0)
        stackView.addArrangedSubview(inputTextView)
        inputTextView.heightAnchor.constraint(equalTo: stackView.heightAnchor, multiplier: 0.45).isActive = true
        inputTextView.widthAnchor.constraint(equalTo: stackView.widthAnchor).isActive = true
        
        outputTextView.translatesAutoresizingMaskIntoConstraints = false
        outputTextView.backgroundColor = UIColor(red: 0.72, green: 0.72, blue: 0.72, alpha: 1.0)
        stackView.addArrangedSubview(outputTextView)
        outputTextView.heightAnchor.constraint(equalTo: stackView.heightAnchor, multiplier: 0.45).isActive = true
        outputTextView.widthAnchor.constraint(equalTo: stackView.widthAnchor).isActive = true
        
//        let storyBoard: UIStoryboard = UIStoryboard(name: "Main", bundle: nil)
//        cameraViewController = storyBoard.instantiateViewController(withIdentifier: "CameraViewController") as? CameraViewController
//
//        let tapGestureRecognizer = UITapGestureRecognizer(target: self, action: #selector(imageTapped(tapGestureRecognizer:)))
//        preview.isUserInteractionEnabled = true
//        preview.addGestureRecognizer(tapGestureRecognizer)
//
//        updatePreviewWithCapturedImage()
        setupWebSocket()
    }
    
    @objc func dismissKeyboard() {
        view.endEditing(true)
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
        outputTextView.setText(text: text)
    }
    
    func websocketDidReceiveData(socket: WebSocketClient, data: Data) {
        print("Web Socket received data!")
        outputTextView.setText(text:  data.base64EncodedString())
    }
}
