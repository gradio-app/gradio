//
//  TextInterface.swift
//  Gradio
//
//  Created by Dawood Khan on 3/9/19.
//  Copyright © 2019 Gradio. All rights reserved.
//

import UIKit

enum InterfaceType: String {
    case Input
    case Output
}

class TextInterface: UIView {

    let interfaceType: InterfaceType?
    var textView: UITextView = UITextView()

    init(interfaceType: InterfaceType) {
        self.interfaceType = interfaceType
        super.init(frame: CGRect.zero)
        setupView()
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    func setupView() {
//        var textView: UITextView = UITextView()
        textView = UITextView()
        textView.translatesAutoresizingMaskIntoConstraints = false
        textView.backgroundColor = UIColor(red: 0.72, green: 0.72, blue: 0.72, alpha: 1.0)
        textView.textColor = UIColor.darkGray
        textView.font = UIFont(name: "ArialMT", size: 24)
        guard let interfaceType = interfaceType else { return }
        if interfaceType == InterfaceType.Input {
            textView.isEditable = true
        } else {
            textView.isEditable = false
        }
        textView.text = "\(interfaceType)".uppercased()
        self.addSubview(textView)
        textView.topAnchor.constraint(equalTo: self.topAnchor).isActive = true
        textView.bottomAnchor.constraint(equalTo: self.bottomAnchor).isActive = true
        textView.leadingAnchor.constraint(equalTo: self.leadingAnchor).isActive = true
        textView.trailingAnchor.constraint(equalTo: self.trailingAnchor).isActive = true
    }
    
    func setText(text: String) {
        textView.text = text
    }
    
}
