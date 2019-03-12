//
//  MainTabBarViewController.swift
//  Gradio
//
//  Created by Dawood Khan on 3/9/19.
//  Copyright © 2019 Gradio. All rights reserved.
//

import UIKit

class MainTabBarViewController: UITabBarController, UITabBarControllerDelegate {

    override func viewDidLoad() {
        super.viewDidLoad()
        self.delegate = self
        // Do any additional setup after loading the view.
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        let firstVC = CameraInterfaceViewController()
        let firstIcon = UITabBarItem(title: "Camera", image: UIImage(named: "Photo Camera Icon"), tag: 1)
        firstVC.tabBarItem = firstIcon
        
        let secondVC = TextToTextViewController()
        let secondIcon = UITabBarItem(title: "Text", image: UIImage(named: "T"), tag: 2)
        secondVC.tabBarItem = secondIcon
        
        let thirdVC = SketchPadToImageViewController()
        let thirdIcon = UITabBarItem(title: "Sketch", image: UIImage(named: "Pencil"), tag: 2)
        thirdVC.tabBarItem = thirdIcon
        
        let controllers = [firstVC, secondVC, thirdVC]
        self.viewControllers = controllers
    }
    
    func tabBarController(_ tabBarController: UITabBarController, shouldSelect viewController: UIViewController) -> Bool {
        return true;
    }

}
