
import React from "react";
import renderer from 'react-test-renderer'
import App, { Item, List, SubmitForm, InputWithLabel } from "./app";
// import axios from 'axios'

  jest.mock('axios')

  describe('item', () => {
    const item = {
      title: 'React',
      url: 'https://reactjs.org/',
      author: 'Jordan Walke name',
      num_comments: 3,
      points: 4,
      objectID: 0,
    };

    let handleRemoveItem = jest.fn();
    let component;
    beforeEach(()=>{
      component = renderer.create(<Item item={item} onRemoveItem={handleRemoveItem} />)
    })

    it('it renders all properties', () => {
      expect(component.root.findByType('a').props.href).toEqual(
        'https://reactjs.org/'
      )
      expect(component.root.findAllByProps({ children: 'Jordan Walke name' }).length ).toEqual(
        2
      )
    })
    it('calls onRemoveItem onClick button', ()=>{
      component.root.findByType('button').props.onClick();
      expect(handleRemoveItem).toHaveBeenCalledTimes(1)
      expect(handleRemoveItem).toHaveBeenCalledWith(item)
      expect(component.root.findAllByType(Item).length).toEqual(1)
    })

    test("renders snapshot", ()=>{
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    })
  })
  
  describe('List', () => {
    const list = [{
      title: 'React',
      url: 'https://reactjs.org/',
      author: 'Jordan Walke name',
      num_comments: 3,
      points: 4,
      objectID: 0,
    },
    {
      title: 'Redux',
      url: 'https://redux.js.org/',
      author: 'Dan Abramov, Andrew Clark',
      num_comments: 2,
      points: 5,
      objectID: 1,
    },
      ];
    it("lenders two items", () => {
      const component = renderer.create(<List list={list}/>)
      expect(component.root.findAllByType(Item).length).toEqual(2)
    })
  })

  describe('SubmitForm',()=>{
    const searchFormProps = {
      searchTerm: 'React', onSearchSubmit: jest.fn(), onSearchInput: jest.fn()
    }
    let component;
    beforeEach(()=>{
      component = renderer.create(<SubmitForm {...searchFormProps} />)
    })
    it("renders input with its value", () =>{
      const value = component.root.findByType('input').props.value;
      expect(value).toEqual('React')

    })

    it("calls with new input", ()=>{
      const pseudoEvent = {target: "Redux"}
      component.root.findByType('input').props.onChange(pseudoEvent)
      expect(searchFormProps.onSearchInput).toHaveBeenCalledTimes(1)
      expect(searchFormProps.onSearchInput).toHaveBeenCalledWith(pseudoEvent)
    })
    it("it submits with the right value", ()=>{
      const pseudoEvent = {}
      component.root.findByType('form').props.onSubmit(pseudoEvent)
      expect(searchFormProps.onSearchSubmit).toHaveBeenCalledTimes(1)
      expect(searchFormProps.onSearchSubmit).toHaveBeenCalledWith(pseudoEvent)
    })

    it("is submit disabled", ()=>{
      component.update(<SubmitForm {...searchFormProps} searchTerm="" />)
      expect(component.root.findByType('button').props.disabled).toBeTruthy()
    })
  })

  describe("App", ()=>{
    it("app is fetching data",async ()=>{
      const list = [{
        title: 'React',
        url: 'https://reactjs.org/',
        author: 'Jordan Walke name',
        num_comments: 3,
        points: 4,
        objectID: 0,
      },
      {
        title: 'Redux',
        url: 'https://redux.js.org/',
        author: 'Dan Abramov, Andrew Clark',
        num_comments: 2,
        points: 5,
        objectID: 1,
      },
        ];
      const promise = Promise.resolve({
        data:{hits: list}
      })
      // axios.get.mockImplimentationOnce(() => promise)
  
      let component;
      await renderer.act(async ()=>{
        component = renderer.create(<App />)

      })
      expect(component.root.findAllByType('p')[1].props.children).toEqual("Sorry, Something went wrong...")
    })
  })
