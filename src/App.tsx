import { stringify } from 'querystring';
import leftposlist from './leftposlist';
import sizelist from './sizelist';
import React, { useState, useEffect, useCallback, createContext, useContext}  from 'react';
import './App.css';
import {allfromcombinations, alltocombinations} from './tailwindcolorcombinations';
import Dropzone from 'react-dropzone'
import DarkModeToggle from "react-dark-mode-toggle";
import html2canvas from 'html2canvas';
import downloadjs from 'downloadjs';


  function getFile(newfile?: any) {
    if (newfile) {
      let parser = new DOMParser().parseFromString(newfile, "text/html")
      let schedule = parser.getElementsByClassName('c86')[0];
      let coursename = parser.getElementsByClassName('c18')[0];
      return [schedule.innerHTML, tableToJSON(coursename.innerHTML)._headers[0][0].split('Term: ')[1]];
    } else {
      return "";
    }
    }

  function tableToJSON(table: string) {
    const HtmlTableToJson = require('html-table-to-json');
    return HtmlTableToJson.parse('<table>' + table + '</table>');
  }

  const CaptureButton = () => {
    const table = document.getElementById('tab');
    html2canvas(table ? table : document.body).then(canvas => 
      downloadjs(canvas.toDataURL("image/png"), 'download.png', 'image/png')
    ) 
  }

  const useFetch = (url: string) : any => {
    const [data, setData] = useState('');
  
    useEffect(() => {
      fetch(url)
        .then((res) => res.text())
        .then((data) => setData(data));
    }, [url]);
  
    return data;
  };

// const darkModeContext = createContext(true);


function App() {
  const fetchFile = useFetch('uploaded/schedule.mhtml')
  const [file, setFile] = useState(getFile(fetchFile)[0]);
  const [coursename, setCoursename] = useState(getFile(fetchFile)[1]);
  const[schedule, setSchedule] = useState<Schedule>({} as Schedule);
  const [isDarkMode, setIsDarkMode] = useState(() => true);
  const [showRaw, setShowRaw] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    setFile(getFile(fetchFile)[0]);
    setCoursename(getFile(fetchFile)[1]);

  }, [fetchFile]);

  useEffect(() => {
    console.log(schedule)
    console.log(tableToJSON(file))
    setSchedule(new Schedule(tableToJSON(file)));



  }, [file]);



  const showFile = (file: any) => {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      
        var reader = new FileReader()
            reader.onload = function (event) {
              const res: any = event.target!.result;
              setFile(getFile(res)[0]);
              setCoursename(getFile(res)[1]);
            }
        reader.readAsText(file);
  } else {
      alert("Your browser is too old to support HTML5 File API");
  }
  }

  // return (<div></div>);
  if (!file){
    return <div>loading..</div>
  } else {
  return (
    
    <div className="App ">
      
      <header className={`App-header ${isDarkMode? '!bg-slate-800':'!bg-slate-300'} p-10 transition ease-in-out`}>

        <DarkModeToggle
        onChange={setIsDarkMode}
        checked={isDarkMode}
        size={80}

      />

      <Dropzone onDrop={acceptedFiles => showFile(acceptedFiles[0])}>
        {({getRootProps, getInputProps}) => (
          <section className= {`${isDarkMode? 'bg-slate-700 border-slate-600': 'bg-slate-200 border-slate-800 text-slate-900'} m-20 p-12 border-dashed border-4  transition ease-in-out`}>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p>Drag 'n' drop HTML schedule file here, or click to select file</p>
            </div>
          </section>
        )}
      </Dropzone>
          

        
      <div id="tab" className={`${isDarkMode? 'nm-concave-slate-800':'nm-concave-slate-300 '}  transition ease-in-out rounded-[0.9rem]`}>

        <div className={`px-5 m-5 text-4xl ${isDarkMode? 'text-slate-200': 'text-slate-800'}`}>{coursename}</div>


      
      <div className='flex' >


        <DaysColumn schedule={schedule} isDarkMode={isDarkMode}/>
        {/* <darkModeContext.Provider value={isDarkMode}> */}
        <TimeTable start={schedule.minmaxtimesarray[0]} end={schedule.minmaxtimesarray[1]} isDarkMode={isDarkMode}/>
        {/* </darkModeContext.Provider> */}


      </div>
      </div>
      {/* <input
          type="file"
          accept=".mhtml"
          onChange={(e) => showFile(e.target!.files![0])}
        /> */}

        <button onClick={() => CaptureButton()}>Capture Schedule</button>
<div className='m-20'>
<button className={`text-xl ${isDarkMode? 'text-slate-200': 'text-slate-800'}`} onClick={() => setShowRaw(!showRaw)}>Show/Hide raw schedule</button>
{showRaw && <table className = {`table-auto items-center text-base ${isDarkMode? 'text-slate-200': 'text-slate-800'}`} dangerouslySetInnerHTML={{__html: file}}></table>}
{/* <button onClick={() => setIsModalOpen(false)}>Open Modal</button> */}
{/* <SlideShowModal isModalOpen = {isModalOpen} setIsModalOpen={setIsModalOpen}/> */}
</div>
      </header>

    </div>
  );
}}


let RangeBetweenTwoNumbers = (start: number, end: number) => {
  let arr = [];
  for (let i = start; i <= end; i++) {
    arr.push(i);
  }
  return arr;
}
function TimeTable (props: {start: number, end: number, isDarkMode:boolean}) {
  let times = RangeBetweenTwoNumbers(props.start, props.end).map(time => <TimeSpace time={time > 12 ? time - 12 : time} key={time} isDarkMode={props.isDarkMode}/>);
  return (
    <div className='flex text-4xl'>
      
      {times}
      
    </div>
  )
}



function TimeSpace(props:{time:number, isDarkMode:boolean}){
  let hourContainerList = RangeBetweenTwoNumbers(1, 5).map((i) => <HourContainer key={i} isDarkMode={props.isDarkMode}/>)
  return (
    <div className={`flex w-[15.625rem] flex-col shadow-md  border-1 ${props.isDarkMode? 'text-slate-200': 'text-slate-800'}`} >
    <div>{props.time}</div>
    {hourContainerList}
    
    </div>
  )
}

function HourContainer(props:{isDarkMode:boolean}){
  return (
  <div className={`flex grow divide-x ${props.isDarkMode? 'text-slate-200': 'text-slate-800'} divide-slate-700 divide-opacity-25`} >
    <HalfHourContainer/>
    <HalfHourContainer/>
  </div>
  )
}

function HalfHourContainer(){
  return (
  <div className='grow ' ></div>
  )
}

function DaysColumn (props: {schedule: Schedule, isDarkMode:boolean}){
  return (
    
    <div className='flex-col box-content w-[13.75rem]'>

      <div className={`relative py-5 px-5 text-4xl ${props.isDarkMode? 'text-slate-200': 'text-slate-800'}`}>Days/Time</div>
      <Day dayName = 'Sunday' cards={props.schedule.cardsList[1 as keyof typeof props.schedule.cardsList]} breakarrows={props.schedule.breaksList[1 as keyof typeof props.schedule.breaksList]} isDarkMode={props.isDarkMode}/>
      <Day dayName = 'Monday' cards={props.schedule.cardsList[2 as keyof typeof props.schedule.cardsList]} breakarrows={props.schedule.breaksList[2 as keyof typeof props.schedule.breaksList]} isDarkMode={props.isDarkMode}/>
      <Day dayName = 'Tuesday' cards={props.schedule.cardsList[3 as keyof typeof props.schedule.cardsList]} breakarrows={props.schedule.breaksList[3 as keyof typeof props.schedule.breaksList]} isDarkMode={props.isDarkMode}/>
      <Day dayName = 'Wednesday' cards={props.schedule.cardsList[4 as keyof typeof props.schedule.cardsList]} breakarrows={props.schedule.breaksList[4 as keyof typeof props.schedule.breaksList]} isDarkMode={props.isDarkMode}/>
      <Day dayName = 'Thursday' cards={props.schedule.cardsList[5 as keyof typeof props.schedule.cardsList]} breakarrows={props.schedule.breaksList[5 as keyof typeof props.schedule.breaksList]} isDarkMode={props.isDarkMode}/>

    </div>
  );
}

function Day(props: {dayName: string, cards?: Array<typeof Card>, breakarrows?: Array<typeof BreakArrow>, isDarkMode:boolean}) {
  return (
    <div className='relative'>
    <div className={`border-1 py-12 px-5 text-4xl ${props.isDarkMode? 'text-slate-200': 'text-slate-800'}`}>{props.dayName}</div>
    {props.cards}
    {props.breakarrows}

    </div>
    
  );
}


function Card(props: {leftpos?: any, size?: any, coursename?: string, key?: string, profname?: string, location?: string, starttime?: string, endtime?: string, bgfromcolor?: string, bgtocolor?: string}) {

  
  return (
    <div className={`absolute rounded-[0.625rem] top-1 ${leftposlist[props.leftpos + 221]} `}>
    <div className={`flex flex-col bg-gradient-to-r ${props.bgfromcolor} ${props.bgtocolor} hover:from-pink-500 hover:to-yellow-500 rounded-[0.625rem] box-content min-w-[9.375rem] ${sizelist[props.size]}`}>
      <div className='flex flex-row  justify-between'>
        <div className={`ml-3 truncate shrink my-2 text-xs `}>{props.profname}</div>
        <div className={`mr-3 mt-2 text-xs`}>{props.location}</div>
      </div>
      <div className={`text-sm`}>{props.key}</div>
      <div className={`text-sm line-clamp-2  overflow-y-hidden mx-5 min-h-[3rem]`}>{props.coursename}</div>

      <div className='flex flex-row  justify-between'>
        <div className={`ml-3 mb-2 text-xs`}>{props.starttime}</div>
        <div className={`mr-3 mb-2 text-xs`}>{props.endtime}</div>
      </div>
      
    </div>
    </div>
  )
}

function BreakArrow (props: {leftpos?: any, size?: any, hours?: string, key?: string}) {

  // const isDarkMode = useContext(darkModeContext);
  return(
    <div className={`container absolute top-1/4 mx-2 ${sizelist[props.size]} ${leftposlist[props.leftpos + 225]}`}>
      <div className='flex items-center justify-between '>
          <div className='absolute left-0 translate-y-[0.5rem] rounded-sm rotate-45 bg-slate-300 shadow-md py-[0.1875rem] px-[0.8125rem]'/>
          <div className='absolute left-0 -translate-y-[0.5rem] rounded-sm -rotate-45 bg-slate-300 shadow-md py-[0.1875rem] px-[0.8125rem]'/>
          <div className='grow p-[0.1875rem] ml-[0.1875rem] bg-slate-300 rounded-md' />

          <div className='grow-0 px-3'>
            <div className={`text-l `}>{props.hours}</div>
            <div className='text-sm'>HOURS BREAK</div>
          </div>

          <div className='grow p-[0.1875rem] mr-[0.1875rem] bg-slate-300 rounded-md' />
          <div className='absolute right-0 translate-y-[0.5rem] rounded-sm -rotate-45 bg-slate-300 shadow-md py-[0.1875rem] px-[0.8125rem]'/>
          <div className='absolute right-0 -translate-y-[0.5rem] rounded-sm rotate-45 bg-slate-300 shadow-md py-[0.1875rem] px-[0.8125rem]'/>

      </div>
    </div>
  )
}

// Create Modal slideshow component, accepts images and a current image index
// exit modal using X button or clicking outside of modal
// has a next and previous button to switch between images
// makes background semi-transparent
// has a caption that displays the image's caption
// images are from the folder 'guide', each image index is the image's name
// image caption is image name with the extension removed

function SlideShowModal(props: {isModalOpen: boolean, setIsModalOpen: any}) {
  const [currentImage, setCurrentImage] = useState(0);
  const captions = {
    1: 'Navigate and login into https://portal.ku.edu.kw/sisapp/faces/login.jspx' as any,
    2: 'Navigate to your schedule from Academic Services > Registeration Services > My Schedule' as any,
    3: 'Set the term' as any,
    4: 'Set file type to HTML and press on print' as any,
    5: 'Grab the downnloaded file and drop it in the dropzone'as any
  }

  return (
    <div>
      
      {props.isModalOpen && 
      <div>
        <div className='fixed inset-0 bg-black opacity-50' onClick={() => props.setIsModalOpen(false)}></div>
        <div className='fixed inset-0 flex justify-center items-center bg-white opacity-50'></div>
          <div className='absolute flex flex-col justify-center items-center max-w-screen-md w-full'>
            <div className='relative w-full'>
              <div className='absolute top-0 left-0 w-full h-full flex justify-center items-center'>
                <div className='absolute top-0 left-0 w-full h-full flex justify-center items-center'>
                  <img className='object-contain w-full h-full' src={`$/guide/${currentImage + 1}.png`} alt=''/>
                </div>
              </div>
            </div>
            <div className='flex justify-center mt-4'>
              <div className='text-center'>
                <div className='text-2xl font-bold'>
                  {currentImage + 1}/5
                </div>
                <div className='text-xs'>
                  {captions[currentImage + 1 as keyof typeof captions]}
                </div>
              </div>
            </div>
            <div className='flex justify-center mt-4'>
              <div className='text-center'>
                <button className='text-sm px-4 py-2 bg-slate-300 rounded-lg shadow-lg hover:bg-slate-500 hover:text-white' onClick={() => setCurrentImage(currentImage - 1)} disabled={currentImage === 0}>Previous</button>
                <button className='text-sm px-4 py-2 bg-slate-300 rounded-lg shadow-lg hover:bg-slate-500 hover:text-white' onClick={() => setCurrentImage(currentImage + 1)} disabled={currentImage === 4}>Next</button>
              </div>
            </div>
            </div>
      </div>}
    </div>
    
  )
}



class Schedule {
  schedulejson:Object;
  classList: Array<any>;
  courseinfo: any;
  minmaxtimesarray: any[];
  cardsList: { 1: any; 2: any; 3: any; 4: any; 5: any; };
  classTimes: { 1: any; 2: any; 3: any; 4: any; 5: any; };
  breaksList: { 1: any; 2: any; 3: any; 4: any; 5: any; };

  constructor(schedulejson: any){
    this.schedulejson = schedulejson;
    
    this.classList = schedulejson.results[0].slice(0, schedulejson.results[0].length - 1).filter((x: { Status: string; }) => x.Status === 'Enrolled');
    this.courseinfo = schedulejson.results[0][schedulejson.results.length - 1];
    this.minmaxtimesarray = this.getMinMaxTimes();
    this.cardsList = this.getCardsList();
    this.classTimes = this.getClassTimes();
    this.breaksList = this.getBreaksList();

  }

  getMinMaxTimes(){
    try{
    let min = parseInt(this.classList[0].Time.split(' ')[0].split(':')[0]);
    let max = parseInt(this.classList[0].Time.split(' ')[1].split(':')[0]);

    this.classList.forEach(element => {
      let min1 = parseInt(element.Time.split(' ')[0].split(':')[0]);
      let splitmax = element.Time.split(' ')[1].split(':')
      let max1 = parseInt(splitmax[0]);
      if(min1 < min) min = min1;
      //if(max1 > max) max = parseInt(splitmax[1]) > 0 ? max1 + 1: max1;
      if(max1 > max) max = max1;
    });
    return [min, max];
  } catch(e){
    return [0, 0];
  }
  }

  classTimeToPx(time: string){
    let startendarray = time.split(' ');
    let starttimetopx = parseInt(startendarray[0].split(':')[0]) * 60 + parseInt(startendarray[0].split(':')[1]);
    let endtimetopx = parseInt(startendarray[1].split(':')[0]) * 60 + parseInt(startendarray[1].split(':')[1]);
    return Math.floor((endtimetopx - starttimetopx) * 250 / 60);
  }

  classLeftPosition(time:string){
    
    let starttime = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
    // console.logfine((starttime / 60 - this.minmaxtimesarray[0]))
    return Math.floor((starttime / 60 - this.minmaxtimesarray[0]) * 250);
  }

  getClassTimes(){
    let days = {
      1: [] as any,
      2: [] as any,
      3: [] as any,
      4: [] as any,
      5: [] as any
    }
  
    this.classList.forEach(element => {
      element.Days.split('').forEach((day: number) => {
        days[day as keyof typeof days].push(element.Time)}
      );
      });
    
    Object.values(days).forEach(day => {
      day.sort((a: string, b: string) => {
        let a1 = parseInt(a.split(' ')[0].split(':')[0])
        let b1 = parseInt(b.split(' ')[0].split(':')[0])
        return a1 - b1;
      });
    
    })
      return days;
    }

  getBreaksList(){
    let days = {
      1: [] as any,
      2: [] as any,
      3: [] as any,
      4: [] as any,
      5: [] as any
    }
    for (const [key, value] of Object.entries(this.classTimes)) {
      if (value.length > 1) {
        for (let i = 0; i < value.length - 1; i++) {
          let starttime = value[i].split(' ')[1];
          let endtime = value[i + 1].split(' ')[0];
          let starttimeinminutes = parseInt(starttime.split(':')[0]) * 60 + parseInt(starttime.split(':')[1]);
          let endtimeinminutes = parseInt(endtime.split(':')[0]) * 60 + parseInt(endtime.split(':')[1]);
          let breaktimeinminutes = endtimeinminutes - starttimeinminutes;

          if (breaktimeinminutes > 15) {
          let breaktime = breaktimeinminutes / 60;
          let breaktimehours = Math.floor(breaktime);
          let breaktimeminutes = Math.round((breaktime - breaktimehours) * 60);
          
          let size = Math.floor(this.classTimeToPx(starttime + ' ' + endtime) * 240 / 250);
          let hours = breaktimehours + ':' + breaktimeminutes;
          let leftpos = this.classLeftPosition(starttime);
          days[key as unknown as keyof typeof days].push(BreakArrow({leftpos, size, hours, key}));
          }
        }
      }
    }

    return days
  }
  getCardsList(){
    let days = {
      1: [] as any,
      2: [] as any,
      3: [] as any,
      4: [] as any,
      5: [] as any
    }
    this.classList.forEach(element => {
      let time = element.Time;


      let leftpos = this.classLeftPosition(time.split(' ')[0]);
      let size = this.classTimeToPx(time);
      let coursename = element['Course Name'];
      let key = element['Course#'];
      let fullprofname = element['Faculty Name'].split(' ');
      let profname = fullprofname[0].split('')[0] + '. ' + fullprofname[fullprofname.length - 1];

      let bgfromcolor = allfromcombinations[Math.floor(Math.random() * allfromcombinations.length)];
      let bgtocolor = alltocombinations[Math.floor(Math.random() * alltocombinations.length)];

      let location = element['Building'] + element['Floor'] + element['Zone']+ element['Room'];
      let starttime = time.split(' ')[0].split(':')[0] > 12 ? time.split(' ')[0].split(':')[0] - 12 + ':' + time.split(' ')[0].split(':')[1] : time.split(' ')[0];
      let endtime = time.split(' ')[1].split(':')[0] > 12 ? time.split(' ')[1].split(':')[0] - 12 + ':' + time.split(' ')[1].split(':')[1] : time.split(' ')[1];
      element.Days.split('').forEach((day: number) => {
      days[day as keyof typeof days].push(Card({leftpos, size, coursename, key, profname, location, starttime, endtime, bgfromcolor, bgtocolor}));
      }
    )
  });
  return days;
}
}
export default App;
