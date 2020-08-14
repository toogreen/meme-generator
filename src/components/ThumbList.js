import React from "react";
import Thumb from "./Thumb"

function ThumbList() {


     //const reptiles = ["alligator", "snake", "lizard"];
     //const reptiles = props.data.allMemeImgs[1].url
  
            const list = ['a', 'b', 'c'];
         
            const SimpleList = () => (
              <ul>
                {list.map(item => {
                  return <li key={item}>{item}</li>;
                })}
              </ul>
            );


  } 



export default ThumbList
