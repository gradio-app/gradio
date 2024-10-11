<div align="centre">

[<img src="../gradio.svg" alt="gradio" width=400>](https://gradio.app)<br>
<em>Créez et partagez facilement de superbes programmes d'apprentissage automatique</em>

[![gradio-backend](https://github.com/gradio-app/gradio/actions/workflows/backend.yml/badge.svg)](https://github.com/gradio-app/gradio/ actions/workflows/backend.yml)
[![gradio-js](https://github.com/gradio-app/gradio/actions/workflows/ui.yml/badge.svg)](https://github.com/gradio-app/gradio/ actions/workflows/ui.yml)
 [![PyPI](https://img.shields.io/pypi/v/gradio)](https://pypi.org/project/gradio/)
[![Téléchargements PyPI](https://img.shields.io/pypi/dm/gradio)](https://pypi.org/project/gradio/)
![Version Python](https://img.shields.io/badge/python-3.10+-important)
[![Suivre Twitter](https://img.shields.io/twitter/follow/gradio?style=social&label=follow)](https://twitter.com/gradio)

[Site officiel](https://gradio.app)
| [Documentation](https://gradio.app/docs/)
| [Guide](https://gradio.app/guides/)
| [Démarrer](https://gradio.app/getting_started/)
| [Exemple](../../démo/)
| [anglais](https://github.com/gradio-app/gradio#readme)

</div>



# Gradio : Créer une application Web de machine learning avec Python

Gradio est une bibliothèque Python open source permettant de créer des démonstrations d'apprentissage automatique ou de science des données et d'applications Web.

En utilisant Gradio, vous pouvez créer rapidement une belle interface utilisateur basée sur votre modèle d'apprentissage automatique ou votre flux de travail de science des données, permettant aux utilisateurs d'« essayer » de glisser-déposer leurs propres images, de coller du texte, d'enregistrer leurs propres voix et de les visualiser via un navigateur. avec votre programme de démonstration.

![Montage d'interface](../header-image.jpg)

Gradio convient pour :

- Démontrez votre modèle d'apprentissage automatique aux clients/partenaires/utilisateurs/étudiants.

- **Déployez** rapidement vos modèles via des liens de partage automatique et obtenez des commentaires sur les performances des modèles.

- **Déboguer** les modèles de manière interactive pendant le développement à l'aide d'outils de manipulation et d'interprétation intégrés.

### Démarrage rapide

**Dépendances** : Gradio nécessite uniquement [Python 3.8 et supérieur](https://www.python.org/downloads/) !

#### Que peut faire Gradio ?

L'un des meilleurs moyens de partager un modèle d'apprentissage automatique, une API ou un flux de travail de science des données avec d'autres consiste à créer une **application interactive** que les utilisateurs ou collègues peuvent essayer dans leur navigateur.

Gradio vous permet de créer des démos en Python et de les partager, souvent avec seulement quelques lignes de code ! Commençons.

#### Bonjour le monde

Pour exécuter l'exemple "Hello World" avec Gradio, les trois étapes suivantes sont requises :

1\. Téléchargez Gradio en utilisant pip :

```bash
pip installer le dégradé
```

2\. Utilisez un script Python ou exécutez le code suivant dans Jupyter Notebook (ou utilisez [Google Colab](https://colab.research.google.com/drive/18ODkJvyxHutTN0P5APWyGFO_xwNcgHDZ?usp=sharing)) :

```python
import gradio as gr

def greet(name):
    return "Hello " + name + "!"

demo = gr.Interface(fn=greet, inputs="text", outputs="text")
demo.launch()
```
3\. La démonstration suivante apparaîtra automatiquement dans Jupyter Notebook si elle est exécutée à l'aide d'un script, elle apparaîtra dans le navigateur [http://localhost:7860](http://localhost:7860) :

![Démo `hello_world`](../../demo/hello_world/screenshot.gif)

#### Classe `Interface`

Vous remarquerez peut-être que lors de l'exécution de l'exemple, nous avons créé une « gradio.Interface ». La classe `Interface` peut encapsuler des fonctions Python arbitraires avec une interface utilisateur. Dans l'exemple ci-dessus, nous avons utilisé une simple fonction basée sur du texte, mais la fonction peut aller d'un générateur de musique à un calculateur de taux d'imposition en passant par une fonction de prédiction pour un modèle d'apprentissage automatique pré-entraîné.

Le cœur de la classe `Interface` nécessite trois paramètres pour l'initialisation :

- `fn` : fonction enveloppée par l'interface utilisateur
- `inputs` : composants utilisés comme entrées (par exemple : `"text"`, `"image"` ou `"audio"`)
- `outputs` : composants utilisés comme sorties (par exemple : `"text"`, `"image"` ou `"label"`)

Ci-dessous, nous analysons plus en détail les composants utilisés pour l'entrée et la sortie.

#### Propriétés des composants

Dans les exemples précédents, nous pouvons voir quelques composants de zone de texte simples « Textbox », mais que se passe-t-il si vous souhaitez modifier l'apparence ou le comportement du composant d'interface utilisateur ?

Supposons que vous souhaitiez personnaliser le champ de texte de saisie, par exemple, vous souhaitez qu'il soit plus grand et qu'il comporte un espace réservé pour le texte. Si nous utilisons la classe réelle de « Textbox » au lieu d'utiliser des raccourcis de chaîne, nous pouvons réaliser une personnalisation via les propriétés des composants


```python
import gradio as gr

def greet(name):
    return "Hello " + name + "!"

demo = gr.Interface(
    fn=greet,
    inputs=gr.Textbox(lines=2, placeholder="Name Here..."),
    outputs="text",
)
demo.launch()
```

![Démo `hello_world_2`](../../demo/hello_world_2/screenshot.gif)

#### Plusieurs composants d'entrée et de sortie

Supposons que vous disposiez d’une fonction plus complexe avec plusieurs entrées et sorties. Dans l'exemple ci-dessous, nous définissons une fonction qui accepte les chaînes, les booléens et les nombres et renvoie les chaînes et les nombres. Observez comment les listes de composants d'entrée et de sortie doivent être transmises.

```python
import gradio as gr

def greet(name, is_morning, temperature):
    salutation = "Good morning" if is_morning else "Good evening"
    greeting = f"{salutation} {name}. It is {temperature} degrees today"
    celsius = (temperature - 32) * 5 / 9
    return greeting, round(celsius, 2)

demo = gr.Interface(
    fn=greet,
    inputs=["text", "checkbox", gr.Slider(0, 100)],
    outputs=["text", "number"],
)
demo.launch()
```
![Démo `hello_world_3`](../../demo/hello_world_3/screenshot.gif)

Vous enveloppez simplement le composant dans une liste. Chaque composant de la liste d'entrées « inputs » correspond à un paramètre de la fonction. Chaque composant de la liste de sortie `outputs` correspond à une valeur de retour de la fonction, les deux dans l'ordre.

#### Un exemple d'image

Gradio prend en charge plusieurs types de composants, tels que « Image », « DateFrame », « Vidéo » ou « Étiquette ». Essayons une fonction image à image pour avoir une idée !

``python
import numpy as np
import gradio as gr

def sepia(input_img):
    sepia_filter = np.array([
        [0.393, 0.769, 0.189],
        [0.349, 0.686, 0.168],
        [0.272, 0.534, 0.131]
    ])
    sepia_img = input_img.dot(sepia_filter.T)
    sepia_img /= sepia_img.max()
    return sepia_img

demo = gr.Interface(sepia, gr.Image(), "image")
demo.launch()

```
![Démo`sepia_filter`](../../demo/sepia_filter/screenshot.gif)

Lorsque vous utilisez un composant `Image` comme entrée, votre fonction recevra un tableau NumPy de forme `(hauteur, largeur, 3)`, où la dernière dimension représente la valeur RVB. Nous renverrons également une image sous forme de tableau NumPy.

Vous pouvez également définir le type de données utilisé par le composant à l'aide de l'argument mot-clé `type=`. Par exemple, si vous souhaitez que votre fonction obtienne le chemin de fichier d'une image plutôt qu'un tableau NumPy, le composant d'entrée `Image` pourrait être écrit comme :

```python
gr.Image(type="chemin du fichier")
```

Notez également que notre composant d'entrée `Image` est livré avec un bouton d'édition 🖉 qui permet de recadrer et d'agrandir l'image. Manipuler des images de cette manière peut aider à révéler des biais ou des défauts cachés dans les modèles d’apprentissage automatique !

Vous pouvez en savoir plus sur les composants et comment les utiliser dans la documentation Gradio.

#### Blocs : plus flexibles et contrôlables


Gradio propose deux classes pour créer des applications

1\. **Interface**, qui fournit une abstraction de haut niveau pour créer les exemples dont nous avons discuté jusqu'à présent.

2\. **Blocks**, une API junior pour concevoir des applications Web avec une mise en page et un flux de données plus flexibles. Les blocs peuvent faire beaucoup de choses, comme caractériser plusieurs flux de données et présentations, contrôler l'endroit où le composant apparaît sur la page, gérer des flux de données complexes (par exemple, la sortie peut être utilisée comme entrée pour d'autres fonctions) et mettre à jour les propriétés du composant basé sur l'interaction utilisateur. /visibility et toujours en Python. Si vous avez besoin de ce type de personnalisation, essayez « Blocs » !

#### Bonjour, Blocs

Regardons un exemple simple. Notez en quoi l'API diffère ici de « Interface ».

```python
import gradio as gr

def greet(name):
    return "Hello " + name + "!"

with gr.Blocks() as demo:
    name = gr.Textbox(label="Name")
    output = gr.Textbox(label="Output Box")
    greet_btn = gr.Button("Greet")
    greet_btn.click(fn=greet, inputs=name, outputs=output)

demo.launch()
```

![Démo `hello_blocks`](../../demo/hello_blocks/screenshot.gif)

Choses à noter :

- `Blocks` se compose d'une clause `with`, tout composant créé dans cette clause est automatiquement ajouté à l'application.
- Les composants apparaissent verticalement dans l'application dans l'ordre dans lequel ils ont été créés (nous aborderons les mises en page personnalisées plus tard !)
- Un bouton `Button` est créé et un écouteur d'événement `click` est ajouté. Cette API semble familière ! Tout comme « Interface », la méthode « click » accepte une fonction Python, un composant d'entrée et un composant de sortie.

#### Plus de complexité

Voici une application pour vous donner un avant-goût de ce qui est possible avec « Blocs  » :

```python
import numpy as np
import gradio as gr

def flip_text(x):
    return x[::-1]

def flip_image(x):
    return np.fliplr(x)

with gr.Blocks() as demo:
    gr.Markdown("Flip text or image files using this demo.")
    with gr.Tabs():
        with gr.TabItem("Flip Text"):
            text_input = gr.Textbox()
            text_output = gr.Textbox()
            text_button = gr.Button("Flip")
        with gr.TabItem("Flip Image"):
            with gr.Row():
                image_input = gr.Image()
                image_output = gr.Image()
            image_button = gr.Button("Flip")

    text_button.click(flip_text, inputs=text_input, outputs=text_output)
    image_button.click(flip_image, inputs=image_input, outputs=image_output)

demo.launch()
```

![Démo `blocks_flipper`](../../demo/blocks_flipper/screenshot.gif)

Il y a tellement plus à faire ! Nous allons vous montrer comment créer une application « Blocs » complexe comme celle-ci dans la section Construire avec des blocs.

Félicitations, vous maîtrisez désormais l'utilisation de base de Gradio ! 🥳 Accédez à notre [chapitre suivant](https://gradio.app/key_features) pour en savoir plus sur les fonctionnalités de Gradio.

## Pile open source

Gradio est construit avec de nombreuses excellentes bibliothèques open source, soutenez-les également !

[<img src="../huggingface_mini.svg" alt="huggingface" height=40>](https://huggingface.co)
[<img src="../python.svg" alt="python" height=40>](https://www.python.org)
[<img src="../fastapi.svg" alt="fastapi" height=40>](https://fastapi.tiangolo.com)
[<img src="../encode.svg" alt="encode" height=40>](https://www.encode.io)
[<img src="../svelte.svg" alt="svelte" height=40>](https://svelte.dev)
[<img src="../vite.svg" alt="vite" height=40>](https://vitejs.dev)
[<img src="../pnpm.svg" alt="pnpm" height=40>](https://pnpm.io)
[<img src="../tailwind.svg" alt="tailwind" height=40>](https://tailwindcss.com)

## protocole

Gradio est sous licence Apache License 2.0 trouvée dans le fichier [LICENSE](LICENSE) dans le répertoire racine de ce référentiel.

## Citation

Consultez également l'article _[Gradio : Partage et test sans tracas de modèles ML dans la nature](https://arxiv.org/abs/1906.02569), ICML HILL 2019_, veuillez le citer si vous utilisez Gradio dans votre travail.

```
@article{abid2019gradio,
  title = {Gradio: Hassle-Free Sharing and Testing of ML Models in the Wild},
  author = {Abid, Abubakar and Abdalla, Ali and Abid, Ali and Khan, Dawood and Alfozan, Abdulrahman and Zou, James},
  journal = {arXiv preprint arXiv:1906.02569},
  year = {2019},
}
```
