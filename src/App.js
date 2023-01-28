
import styled from 'styled-components';
import {ReactComponent as Check} from './check.svg';
import { sortBy } from 'lodash';

import React from 'react';
import axios from 'axios';

// css styles
// start
const StyledContainer = styled.div`
  height: auto;
  padding: 20px;
  background: #83a4d4;
  background: linear-gradient(to left, #b6fbff, #83a4d4);
  color: #171212;
`;
const StyledHeadlinePrimary = styled.h1`
font-size: 48px;
font-weight: 300;
letter-spacing: 2px;
`;
const StyledColumn = styled.span`
  padding: 0 5px;
  white-space: nowrap;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  a{
    color: inherit;
  }

  width: ${props => props.width}
`
const StyledItem = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 5px
`;
const StyledButton = styled.button`
  background: transparent;
  border: 1px solid #171212;
  cursor: pointer;
  transition: all 0.1s ease-in;
  &:hover{
    background: #171212;
    color: #ffffff;
  }
`;
const StyledTitleButton = styled(StyledButton)`
  color: inherit;
  background: opeque;
`
const StyledSmallButton = styled(StyledButton)`
padding: 5px;

&:hover > svg > g{
  fill: #ffffff;
  stroke: #ffffff;
}
`;
const StyledBigButton = styled(StyledButton)`
  padding: 5px 10px;
  font-size: 1.5rem;
  margin-left: 1rem;
`;
const StyledSearchForm = styled.form`
  padding: 10px 0 20px 0;
  display: flex;
  align-items: baseline;
`;
const StyledInput = styled.input`
  border: none;
  border-bottom: 1px solid #171212;
  background-color: transparent;
  font-size: 24px;
`;
const StyledLabel = styled.label`
  border-top: 1px solid #171212;
  border-left: 1px solid #171212;
  padding-left: 5px;
  font-size: 24px;
`;
const StyledTableTitle = styled.div`
  display: flex;
  
  button{
    font-weight: bold;
    cursor: pointer;
    padding: 5px;
  }
  button:hover{
    
      fill: #ffffff;
      stroke: #ffffff;
    
  }
`
// end

// Typescript types
const types ={
// // 
//   // type Story = {
//   //   objectID : string;
//   //   url : string;
//   //   title: string;
//   //   author: string;
//   //   num_comments: number;
//   //   points: number;
//   // };
//   // type ItemProps = {
//   //   item: Story;
//   //   onRemoveItem: (item: Story) => void;
//   // }
//   // type Stories = Array<Story>
//   // type ListProps = {
//   //   list: Stories;
//   //   onChangeStories: (item: Story) => void;
//   // }
//   // type StoriesState = {
//   //   data: Stories;
//   //   isLoading: boolean;
//   //   isError: boolean;
//   // }
  
//   // interface StoriesFetchInitAction {
//   //   type: 'FETCH_STORIES_INIT'
//   // }
//   // interface StoriesFetchSuccessAction {
//   //   type: 'FETCH_STORIES_SUCCESS';
//   //   payload: Stories
//   // }
//   // interface StoriesFetchFailureAction {
//   //   type: 'FETCH_STORIES_FAILURE'
//   // }
//   // interface StoriesRemoveAction {
//   //   type: 'REMOVE_STORY';
//   //   payload: Story;
//   // }
//   // type StoriesAction = 
//   //   | StoriesFetchInitAction
//   //   | StoriesFetchSuccessAction
//   //   | StoriesFetchFailureAction
//   //   | StoriesRemoveAction
//   // type SearchFormProps = {
//   //   searchTerm: string;
//   //   onSearchInput: (Event) => void;
//   //   onSearchSubmit: (Event: React.ChangeEvent<HTMLFormElement>) => void;
//   // }
//   // type InputLabelProps = {
//   //   type?: string;
//   //   value: string;
//   //   id: string;
//   //   isFocused?: boolean;
//   //   children: React.ReactNode;
//   //   onInputWithLabel: (event) => void;
//   // }
}

const useSemiPersistanceState = (key, initialStart) => {
  const isMounted = React.useRef(false);
  const [value, setValue] = React.useState(localStorage.getItem(key) || initialStart)
  
    React.useEffect(()=>{
      if(!isMounted.current){
        isMounted.current = true;
      }else{
        localStorage.setItem(key,value)
      }
    },[value, key])

    return [value, setValue];
}

const storiesReducer = (state, action) => {
  switch(action.type){
    case "FETCH_STORIES_INIT": return ({...state, isLoading: true, isError:false});
    case "FETCH_STORIES_SUCCESS": return ({...state, isLoading: false, isError:false, 
                                data: action.payload.list, page: action.payload.page})
    case "FETCH_STORIES_FAILURE": return ({...state, isLoading: false, isError:true})
    case "REMOVE_STORY": 
    console.log(action.payload)
      return ({...state, data: state.data.filter(story =>story.objectID !== action.payload.objectID)});
    default: throw new Error();
  }
}
const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';
const getUrl = (searchTerm,page) => `${API_ENDPOINT}${searchTerm}&page=${page}`

const App = ()=>{

  const [searchTerm, setSearchName ] = useSemiPersistanceState('search',"react");
  const [urls, setUrls] = React.useState([getUrl(searchTerm,0)])
  const getLastSearches = urls => {
    const terms = urls.reduce((result, url, index) => {
      if(index === 0) return result.concat(url);
      const previousUrl = result[result-1];
      if(previousUrl === url) return result;
      return result.concat(url);
    },[])
    .slice(-6,-1).map(url => url.substring(url.indexOf('=')+1, url.indexOf('&')))
    let sortedTerm = [];
    terms.forEach(term =>{
      if(!sortedTerm.includes(term)) sortedTerm.push(term)
    })
    return sortedTerm;
  }

  const handleSearchInput = (event) =>{
    setSearchName(event.target.value);
  }
  const handleSearchSubmit= (event) =>{
    event.preventDefault();
    setUrls(urls.concat(getUrl(searchTerm,0)));
  };

  // handling last array search
  const [stories, dispatchStories] = React.useReducer(storiesReducer,
            {data: [], page:0, isLoading:false, isError:false})

  const handleFecthStories = React.useCallback(async ()=>{
    if(!searchTerm) return;

    dispatchStories({type: "FETCH_STORIES_INIT"})
    try{
      const result = await axios.get(urls[urls.length-1])
      dispatchStories({type: "FETCH_STORIES_SUCCESS", 
        payload: {list: result.data.hits, page: result.data.page}})
    }catch(err){
      dispatchStories({type: "FETCH_STORIES_FAILURE"})
    }
  },[urls]);

  React.useEffect(()=>{
    handleFecthStories()
  },[handleFecthStories])

  // handling button clicked history search
  const handleLastSearch = searchTerm =>{
    setSearchName(searchTerm)
    setUrls(urls.concat(getUrl(searchTerm,0)))
  }

  const handleRemoveStories = (item) =>{
     dispatchStories({type: "REMOVE_STORY", payload: item})
  };

  // const handleNextPage = () => {
  //   const lastUrl = urls[urls.length - 1]
  //   const searchTerm = getLastSearches(lastUrl)
  //   console.log(lastUrl,searchTerm)
  //   setUrls(urls.concat(getUrl(searchTerm,resu)))
  // }

  const totalComments = React.useMemo(()=>sumComments(stories),[stories])
  const lastSearchTerms = getLastSearches(urls);
  
    return (
      <StyledContainer>
        <StyledHeadlinePrimary >My Hacker Stories with {totalComments} comments</StyledHeadlinePrimary>
        <SubmitForm searchTerm={searchTerm} onSearchSubmit={handleSearchSubmit}
                    onSearchInput={handleSearchInput} />
        <LastSearches handleLastSearch={handleLastSearch} lastSearchTerms={lastSearchTerms} />       

        {stories.isError && <p>Sorry, Something went wrong...</p>}
        {stories.isLoading && !stories.isError? (<p>Loading...</p>) :
        (<List list={stories.data} onChangeStories = {handleRemoveStories}/>) }
        <div>
          <button type='button' >Next Page</button>
        </div>
      </StyledContainer>
    )
}

const PassText = ({text}) => (<strong>{text }</strong> )

// searches buttons
const LastSearches = ({handleLastSearch, lastSearchTerms}) =>(
  lastSearchTerms.map((searchTerm, index) =>
    (<button key={searchTerm + index} type='button' 
    onClick={()=>handleLastSearch(searchTerm)}>{searchTerm}</button>)
  )
)

// heavy computations
const sumComments = stories =>
   stories.data.reduce((start, value)=> start + value.num_comments, 0)


// submitting a form
const SubmitForm = React.memo(( {searchTerm,onSearchSubmit,onSearchInput} ) => (
    <StyledSearchForm onSubmit={onSearchSubmit}>
          <InputWithLabel id ="search" onInputWithLabel = {onSearchInput} 
            value = {searchTerm} type = "text" isFocused >
            <PassText text="Search: "/>
          </InputWithLabel>

          <StyledBigButton type='submit' disabled={!searchTerm}>Submit</StyledBigButton>
    </StyledSearchForm>
))

const InputWithLabel = ({id, type='text', value, isFocused, onInputWithLabel, children}) =>{
  const inputRef = React.useRef();
  React.useEffect(()=>{
    if(isFocused && inputRef.current){
      inputRef.current.focus()
    } 
  },[isFocused])

    return(
      <>
      <StyledLabel htmlFor={id}> {children} </StyledLabel>
      &nbsp;
          <StyledInput ref={inputRef} type={type} id={id} value={value} onChange={onInputWithLabel}/>
          <br/>
          <p>Searching for {value}</p>
          {/* <List /> */}
      </>
  )
}  

const SORTS = {
    NONE: list => list,
    TITLE: list => sortBy(list, "title"),
    COMMENT: list => sortBy(list, "num_comments").reverse(),
    AUTHOR: list => sortBy(list, "author"),
    POINT: list => sortBy(list, "points").reverse(),
}

const List = ({list, onChangeStories}) => {

const [sort, setSort] = React.useState({sortKey: "NONE", isReverse: false})
const handleSort = (event, sortKey) => {
  const isReverse = sort.sortKey === sortKey && !sort.isReverse
  setSort({sortKey, isReverse});

  document.querySelectorAll('.sorting').forEach(node => {
    node.querySelector('button').removeAttribute("style")
  })
  event.target.setAttribute("style", "color: red");
}

const sortFunction = SORTS[sort.sortKey];
const sortedList = sort.isReverse? sortFunction(list).reverse(): sortFunction(list);

return(
    <div >
      <StyledTableTitle>
        <span class="sorting" style={{width: '40%'}}><StyledTitleButton type='button' 
          onClick={(e)=>handleSort(e,'TITLE')}> Title </StyledTitleButton></span>
        <span class="sorting" style={{width: "30%"}}><StyledTitleButton type='button' 
          onClick={(e)=>handleSort(e,'AUTHOR')}> Author </StyledTitleButton></span>
        <span class="sorting" style={{width: '10%'}}><StyledTitleButton type='button' 
          onClick={(e)=>handleSort(e,'COMMENT')}> Comments </StyledTitleButton></span>
        <span class="sorting" style={{width: '10%'}}><StyledTitleButton type='button' 
          onClick={(e)=>handleSort(e,'POINT')}> Points </StyledTitleButton></span>
        <span style={{width: '10%'}}>Action</span>
      </StyledTableTitle>
        <>{sortedList.map(item => (<Item item = {item}
                  onRemoveItem={onChangeStories}/>))}</>
    </div>
)}

const Item = ({item, onRemoveItem})=>
  (
    <StyledItem>
      <StyledColumn width ="40%"><a href={item.url}>{item.title}</a></StyledColumn>
      <StyledColumn width ='30%'>{item.author}</StyledColumn>
      <StyledColumn width ='10%'>{item.num_comments}</StyledColumn>
      <StyledColumn width ='10%'>{item.points}</StyledColumn>
      <StyledColumn width ='10%'>
      <StyledSmallButton type='button' onClick={()=>onRemoveItem(item)}>
        <Check width="18px" height="18px" /></StyledSmallButton>
      </StyledColumn>
            <br/>
    </StyledItem>
  )

export default App;
export {SubmitForm, InputWithLabel, List, Item}
