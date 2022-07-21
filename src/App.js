import './App.css';
import React, {useEffect, useState} from "react";
import { Chart as ChartJS, registerables } from 'chart.js';
import {NAMES_DATA_ARRAY} from "./datasets/names-data";
import { Line } from "react-chartjs-2";
import { ReactComponent as DeleteIcon } from './delete.svg';

ChartJS.register(...registerables);

const range = (start, end) => Array(end - start + 1).fill().map((_, idx) => start + idx)

const getRandomName = () => {
  const index = Math.floor(Math.random() * NAMES_DATA_ARRAY.length);
  return NAMES_DATA_ARRAY[index].names;
}

const getRandombckColor = () => {
  return `rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`
}
const parseYearValue = yearValue => {
  if (yearValue === ".") return 0;
  if(yearValue === "..") return Math.floor(Math.random() * 4);
  return yearValue;
}

const createDataFromRow = row => {
  const data = {
    x: [],
    y: [],
    name: row.names,
    total: row.total,
  };
  const years = range(1948, 2021);
  years.forEach(year => {
    data.y.push(parseYearValue(row[year]));
    data.x.push(year);
  });

  return data;
}



function App() {
  const [data, setData] = useState({
    labels: [],
    datasets: [],
  });

  const [searchValue, setSearchValue] = useState(getRandomName());

  const getRowByName = name => {
    const row = NAMES_DATA_ARRAY.find(item => item.names === name);
    return row;
  }

  const updateDataset = (name) => {
    const rowData = getRowByName(name);
    let plotData;
    if (rowData) {
      const data = createDataFromRow(rowData);
      const color = getRandombckColor();
      plotData = {
        labels: data.x,
        total: data.total,
        datasets: [
          {
            label: data.name,
            data: data.y,
            borderColor: color,
            backgroundColor: color,
          }
        ]
      }
    }
    setData(plotData);
  }

  const onRandomNameClick = () => {
    const randomName = getRandomName();
    addDataSet(randomName);
    setSearchValue(randomName);
  }

  const addDataSet = (name) => {
    const updateData = Object.assign({}, data);
    const rowData = getRowByName(name);
    const parsedData = createDataFromRow(rowData);
    if (rowData) {
      const color = getRandombckColor();
      updateData.datasets = [
        ...data.datasets,
        {
          label: parsedData.name,
          data: parsedData.y,
          borderColor: color,
          backgroundColor: color,
        }
      ];
      setData(updateData);
    }
  }

  const onClear = () => {
    setSearchValue('');
    setData(prev => {
      const updated = Object.assign({}, prev);
      updated.datasets = [];
      updated.total = undefined;
      return updated;
    });
  }

  useEffect(() => updateDataset(searchValue), []);
  useEffect(() => {
    document.title = 'שמות בישראל';
  }, []);

  const isPlotDisabled = () => {
    if (!searchValue || !getRowByName(searchValue)) {
      return true;
    }
    const names = data?.datasets?.map(item => item.label);
    if (names?.includes(searchValue)) {
      return true;
    };
    return false;
  }

  return (
    <div className="App">
      <div className="main-view">
        <div className="search-input">
          <input
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          />
          <button disabled={isPlotDisabled()} onClick={() => addDataSet(searchValue)}>
            Plot
          </button>
          <button onClick={onRandomNameClick}>
            Plot Random
          </button>
          <div title="נקה את הרשימה" className="clear-icon" onClick={onClear}>
            <DeleteIcon />
          </div>
        </div>
          {data ?
            <div className="plot-wrapper">
              {/*<div className="total-row-wrapper">*/}
              {/*  <div className="value">{data?.total}</div>*/}
              {/*  <div className="text">סה"כ בין 1948 - 2021</div>*/}
              {/*</div>*/}
              <Line
                className="plot"
                datasetIdKey='id'
                data={data}
              />
            </div> :
            <div>
               אין שם כזה סורי
            </div>
          }
      </div>
    </div>
  );
}

export default App;
