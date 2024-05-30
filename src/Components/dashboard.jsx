import axios from "axios";
import * as React from "react";
import Chart from "react-google-charts";
import { getDashBoardUrl } from "./constants";

const requiredKeys = ["intensity","likelihood","relevance"];//,"year","country",'topic',"region","city"

const filters = ['year','topic','sector','region','pestle','source','country'];

const Dashboard = (props)=>{
    const [dashboardData,setDashboardData] = React.useState([]);
    const [searchStrings,setSearchStrings]= React.useState({});
    const [searching,setSearching] = React.useState(true);
    console.log('searchStrings',searchStrings);
    const getDashBoardData = ()=>{
        setSearching(true);;
            axios.post(getDashBoardUrl,{...searchStrings})
            .then(response=>{
                if (response.status===200){
                    setDashboardData(response.data.data);
                    // setDashboardData([])
                    setSearching(false);
                }else{
                    console.log("Something went wrong");
                }
            })
            .catch(e=>console.error("something went wrong",e))
    }

    const getYear = (str)=>{
        const date = new Date(str);
        return date.getFullYear();
    }

    const keywiseFilteringData=()=>{
        let reqKeysArr = [];
       if(dashboardData.length>0){ 
        // const keys = Object.keys(dashboardData[0]);
        dashboardData.forEach(item=>{
            let obj={}
            requiredKeys.forEach(key=>{
                if(key==='city'){
                    obj[key]=item['region'];
                }else if(key==='year'){
                    obj[key]=item['start_year']?item['start_year']:(item['added']?getYear(item['added']):(item['published']?getYear(item['published']):2017))
                }else{
                    obj[key]=item[key];
                }
                
            })
            reqKeysArr.push(obj);
        });

        }
        return reqKeysArr;
    }

    const prepareChartData =(arr)=>{
           const chartData = [];
 
        arr.forEach((element,index) => {
            if(!!index){
                chartData.push(Object.values(element));
            }else{
                chartData.push(Object.keys(element));
                chartData.push(Object.values(element));
            }
        });
        return chartData
}

    const cData = prepareChartData(keywiseFilteringData());
    console.log("cDAta - - ->",cData)

    const options = {
        title: "Dashboard Data",
        hAxis: { title: "intensity", titleTextStyle: { color: "#333" } },
        vAxis: { minValue: 0 },
        chartArea: { width: "50%", height: "70%" },
      };

      const containerStyles = dashboardData.length>0?'d-flex flex-column':"d-flex justify-content-center";

      const onChange = (e)=>{
        const key=e.target.name==='year'?'added':e.target.name;
        setSearchStrings({...searchStrings,[key]:e.target.value});
      }

      React.useEffect(()=>{
          getDashBoardData();
      },[]);

    return<div className={containerStyles} style={{height:'100vh'}}>
        {/* height: 100vh;
    display: flex;
    justify-content: center; */}
        {
          searching===false?
          <>
        <h1 className="mb-4">Welcome to the Dashboard</h1>
        <div className="d-flex flex-wrap justify-content-center">
        {filters.map((item,index)=>
        <div className="form-row" key={index} style={{margin:5}}>
            <div className="form-group d-flex flex-column justify-content-start text-start">
                <label for={item}>{item.toLocaleUpperCase()}</label>
                <input  onChange={onChange} placeholder={`Enter ${item} to Search`} value={searchStrings[item]} name={item} />
            </div>
        </div>
        
        )}
            <div className="form-row pt-4">
             <button className="btn btn-success" onClick={()=>getDashBoardData()}>Search</button>
            </div>
        </div>
        
          {
          dashboardData.length>0 &&
          <Chart 
            chartType="AreaChart"
            width="100%"
            height="400px"
            data={cData}
            options={options}
            />}
          </>
          :  
          <div className='d-flex flex-column justify-content-center align-items-center'>
        <div class="spinner-border text-success mb-2" role="status">
        </div>
        <span class="sr-only">Loading...</span>
      </div>
        }
    </div>
}

export default Dashboard;