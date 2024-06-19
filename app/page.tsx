"use client"
import axios from "axios";
import { ChangeEvent, useEffect, useState } from "react";
import { Hearts } from "react-loader-spinner";

export default function Home() {
  // state variables 
  const [rows, setRows] = useState(2);
  const [input, setinput] = useState("")
  // output is of type array so we can use map functions
  const [output, setoutput] = useState<{label : string; score: number}[]>();
  const [loading, setLoading] = useState(false)
  const [tagsVisible, setTagsVisible] = useState(false)

  // use effect -> code block that runs as side effect of changed state
  useEffect(() => {
    // 
    const inputTimeout = setTimeout(() => {
      runPredictions(); 
    }, 1000);
    return () => clearTimeout(inputTimeout)
  }, [input]) 


  async function runPredictions() {
    if (input) {
      // send api call 
      setLoading(true);
      setTagsVisible(false);
      const res = await axios.post("api/emotion", { input })
      console.log(res);
      setoutput(res.data.filteredResponse)
      setLoading(false);
      setTagsVisible(true); 

    }
  }
  useEffect(() => {
    setTagsVisible(true); 
  
    
  }, [output])
  
  
  function handleInputChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    setinput(event.target.value);

    // increase teh number of rows if required 
    // scrollHeight is the measure of the content's height
    // each line is 20px high

    const newRows = Math.max(1, Math.ceil(event.target.scrollHeight) / 20); 
    setRows(newRows); 
  }

  return (
    <main className="gap-4 flex min-h-screen flex-col items-center p-24">
      <h1 className="lg:text-4xl text-2xl text-center font-mono font-semibold tracking-tight">Type how you're feeling!</h1>
      <div className="min-w-80 w-1/2 border-2 border-black p-4 rounded-large">
        <textarea rows = {rows} onChange={handleInputChange}
        placeholder="I'm feeling..." className="resize-none block outline-none w-full min-h-10 text-sm  placeholder-slate-600 bg-transparent">

        </textarea>
       
      </div>
      <p> {'>' + input}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
          {output?.map(({label, score}) => {
            return <span key={label} style={{opacity: tagsVisible ? 1 : 0}} className="transition-all cursor-pointer bg-indigo-100 text-lg px-4 py-1 rounded-full border border-indigo-400">{label}</span>
          })}
         </div>
         {loading && renderLoader()}
    </main>
  );
  function renderLoader() {

  return <Hearts
    height="80"
    width="80"
    color="#949cfb"
    ariaLabel="hearts-loading"
    wrapperStyle={{}}
    wrapperClass=""
    visible={true}
    />
  }

}


