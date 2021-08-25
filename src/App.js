import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  
/* 
Takes an image URL and a country name, and renders a 
list item that can be pinned to or removed from the
"Selected Countries" list.
*/

const [savedCountries, setSavedCountries] = useState([])

useEffect(() => {
  fetch('/countries').then(res => res.json()).then(data=> {
    setSavedCountries(data.response)
  })}, [])

const CountryListItem = ({flag_url, country_name, button_type}) => {
  const handleClick = e => {
    const buttonText = e.target.innerHTML
    const country = e.target.name
    const flag = e.target.id

    const newCountry = {
      name: country,
      flag: flag
    }

    const addOptions = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name: country, flag: flag})
    }

    const deleteOptions = {
      method: 'DELETE',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name: country})
    }

    if (buttonText === "+" & savedCountries.find(e => e.name === country) === undefined) {
      setSavedCountries([...savedCountries, newCountry])
      fetch("/countries/add", addOptions)
      .then(response => response.json())
      // could add toast to confirm country added
      .then(data => console.log(data.response))
    } else if (buttonText === "x") {
      const updatedList = savedCountries.filter(e => e.name !== country)
      setSavedCountries(updatedList)
      fetch("/countries/delete", deleteOptions)
      .then(response => response.json())
      // could add toast to confirm country deleted
      .then(data => console.log(data.response))
    }
  }

  return (
      <li className="list-group-item">
        <span className="country_span">
        <span className="flag_image">
          <img alt="country flag" src={flag_url} />
        </span>
        <span className="country_name">
          {country_name}
        </span>
        </span>
        <span className="button">
        <button type="button" onClick={handleClick} name={country_name} id={flag_url}>
          {button_type === "add" ? "+" : "x"}
        </button>
        </span>
      </li>
  );
}


/* 
The search bar and search results. Add a handler that makes
a rest-countries API request on key press, and returns the     
first 5 results as <CountryListItem /> components. 
Show a loading state while API request is not resolved!
*/
const Search = () => {

  const [searchTerm, setSearchTerm] = useState("")
  const [resultsList, setResultsList] = useState([])
  const [loading, setLoading] = useState(false)
  const [noResults, setNoResults] = useState(false)

  useEffect(() => {
    if (searchTerm) {
      setLoading(true)
      setNoResults(false)
    fetch(`/countries/extra/${searchTerm}`).then(res => res.json()).then(data=> {
      if (data.response.length) {
        setLoading(false)
      setResultsList(data.response)
      } else {
        setLoading(false)
        setNoResults(true)
        setResultsList([])
      }
    })
  }
  }, [searchTerm])

  const handleChange = e => {
    const searchTerm = e.target.value
    setSearchTerm(searchTerm)
  }
    return (
      <div>
        <input
          type="text"
          placeholder="Start typing a country name here"
          name="search_input"
          onChange={handleChange}
        />
        <h2>Search Results: </h2>
        <ul>
        {loading && 
        <p>Searching for results</p>}
        {resultsList && resultsList.map((item) => (
          <CountryListItem key={item.name} country_name={item.name} flag_url={item.flag} button_type={"add"} />
        ))}
        {noResults && 
        <p>No results found!</p>
        }
        </ul>
      </div>
    );
  }


/* 
A list of selected countries (no duplicates). Replace
the singular <CountryListItem /> below with the list of 
all selected countries.
*/
const SelectedCountries = () => {
  return (
    <div className="selected_countries_div">
      <h2> Selected Countries: </h2>
      <ul className="selected_countries_list">
      {savedCountries && savedCountries.map((item) => (
          <CountryListItem key={item.name} country_name={item.name} flag_url={item.flag} button_type={"remove"} />
        ))}
      </ul>
    </div>
  )
}


/* 
The entire app that gets rendered in the "root" 
element of the page
*/
const ListSearchApp = () => {

  return (
    <div className="app">
    <h1>Country Search</h1>
    <div className="data">
      <Search />
      <SelectedCountries />
    </div>
    </div>
  )
}

return ListSearchApp()
}

export default App;
