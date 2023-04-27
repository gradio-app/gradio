import os

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

import gradio as gr

current_dir = os.path.dirname(os.path.realpath(__file__))
data = pd.read_csv(os.path.join(current_dir, "files/titanic.csv"))


def encode_age(df):
    df.Age = df.Age.fillna(-0.5)
    bins = (-1, 0, 5, 12, 18, 25, 35, 60, 120)
    categories = pd.cut(df.Age, bins, labels=False)
    df.Age = categories
    return df


def encode_fare(df):
    df.Fare = df.Fare.fillna(-0.5)
    bins = (-1, 0, 8, 15, 31, 1000)
    categories = pd.cut(df.Fare, bins, labels=False)
    df.Fare = categories
    return df


def encode_df(df):
    df = encode_age(df)
    df = encode_fare(df)
    sex_mapping = {"male": 0, "female": 1}
    df = df.replace({"Sex": sex_mapping})
    embark_mapping = {"S": 1, "C": 2, "Q": 3}
    df = df.replace({"Embarked": embark_mapping})
    df.Embarked = df.Embarked.fillna(0)
    df["Company"] = 0
    df.loc[(df["SibSp"] > 0), "Company"] = 1
    df.loc[(df["Parch"] > 0), "Company"] = 2
    df.loc[(df["SibSp"] > 0) & (df["Parch"] > 0), "Company"] = 3
    df = df[
        [
            "PassengerId",
            "Pclass",
            "Sex",
            "Age",
            "Fare",
            "Embarked",
            "Company",
            "Survived",
        ]
    ]
    return df


train = encode_df(data)

X_all = train.drop(["Survived", "PassengerId"], axis=1)
y_all = train["Survived"]

num_test = 0.20
X_train, X_test, y_train, y_test = train_test_split(
    X_all, y_all, test_size=num_test, random_state=23
)

clf = RandomForestClassifier()
clf.fit(X_train, y_train)
predictions = clf.predict(X_test)


def predict_survival(passenger_class, is_male, age, company, fare, embark_point):
    if passenger_class is None or embark_point is None:
        return None
    df = pd.DataFrame.from_dict(
        {
            "Pclass": [passenger_class + 1],
            "Sex": [0 if is_male else 1],
            "Age": [age],
            "Fare": [fare],
            "Embarked": [embark_point + 1],
            "Company": [
                (1 if "Sibling" in company else 0) + (2 if "Child" in company else 0)
            ]
        }
    )
    df = encode_age(df)
    df = encode_fare(df)
    pred = clf.predict_proba(df)[0]
    return {"Perishes": float(pred[0]), "Survives": float(pred[1])}


demo = gr.Interface(
    predict_survival,
    [
        gr.Dropdown(["first", "second", "third"], type="index"),
        "checkbox",
        gr.Slider(0, 80, value=25),
        gr.CheckboxGroup(["Sibling", "Child"], label="Travelling with (select all)"),
        gr.Number(value=20),
        gr.Radio(["S", "C", "Q"], type="index"),
    ],
    "label",
    examples=[
        ["first", True, 30, [], 50, "S"],
        ["second", False, 40, ["Sibling", "Child"], 10, "Q"],
        ["third", True, 30, ["Child"], 20, "S"],
    ],
    interpretation="default",
    live=True,
)

if __name__ == "__main__":
    demo.launch()
