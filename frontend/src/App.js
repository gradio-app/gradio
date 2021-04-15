import './App.css';
import GradioInterface from './gradio.js';

function App() {
  let config = {"allow_embedding":false,"allow_flagging":true,"allow_interpretation":false,"allow_screenshot":true,"article":null,"description":null,"examples":[[5,"add",3],[4,"divide",2],[-4,"multiply",2.5],[0,"subtract",1.2]],"examples_per_page":10,"flagging_options":null,"function_count":1,"input_components":[{"default":null,"label":"num1","name":"number"},{"choices":["add","subtract","multiply","divide"],"label":"operation","name":"radio"},{"default":null,"label":"num2","name":"number"}],"layout":"horizontal","live":false,"output_components":[{"label":"Output","name":"textbox"}],"show_input":true,"show_output":true,"thumbnail":null,"title":"test calculator"}
  let fn = (data, action) => {
    return fetch("/" + action + "/", {
      method: "POST", 
      data: JSON.stringify({ "data": data }),
    });
  }
  return <GradioInterface {...config} fn={fn} />;
}

export default App;
