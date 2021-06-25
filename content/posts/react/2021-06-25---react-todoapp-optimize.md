---
title: REACT 일정관리앱 컴포넌트 성능 최적화
date: "2021-06-25T13:00:00.169Z"
template: "post"
draft: false
slug: "react-todoapp-optimization"
category: "gatsby"
tags:
  - "react"
description: "리액트 일정관리 앱 컴포넌트 성능최적화"
---

## 일정관리 앱 컴포넌트 성능 최적화

1. 일정관리 앱의 구조는 아래와 같다.

<img src="/Users/joyeonglae/TIL/react learning/일정관리 앱 만들기/img/일정관리.png" alt="image-20210621183841192" style="zoom:67%;" />

2. 많은 데이터 렌더링하기

   - for 문을 이용하여 2500개의 데이터를 만들어주었다.

     ```react
     //App.js

     function createBulkTodos() {
       const array = [];
       for (let i = 0; i <=2500; i++) {
         array.push({
           id: i,
           text: `할 일  ${i}`,
           checked: false
         });
       }
       return array
     }
     ...
     ```

     ```react
     //App.js

     const App = () => {
       const [todos, setTodos] = useState(createBulkTodos);

       const nextId = useRef(2501);
     ... ...
     ```

     여기서 주의 할 점은 State의 기본값으로 함수(createBulkTodos) 자체를 넣었다는 것이다. 만약 createBulkTodos() 가 State의 기본값으로 들어간다면, 리렌더링 될 떄마다 createBulkTodos가 실행되지만, 함수를 그대로 참조하면 처음 렌더링될떄만 함수를 실행할 수 있다.

3. 크롬 개발자 도구를 통해 성능을 테스트

   개발자도구의 perfomance 탭을 각각의 항목을 체크하여 리렌더링 될 때 평균적으로 약 300ms 정도 걸린다는 것을 확인

4. 느려지는 원인 분석

   컴포넌트는 아래의 상황에서 리렌더링이 발생함.

   1. 자신이 전달받는 props가 변경될 때
   2. 자신의 state가 바뀔 때
   3. 부모 컴포넌트가 리렌더링될 때
   4. forceUpdate 함수가 실행될 때

   이 앱에서 리렌더링은 각 항목을 체크할 때 컴포넌트의 state가 변경되면서 발생함.

   이 때 변경된 state가 적용되는 부분만 리렌더링 되는 것이 아니라 2500개의 컴포넌트 모두를 리렌더링하면서 성능저하가 발생함.

5. React.memo를 사용하여 컴포넌트 성능 최적화

   React.memo는 컴포넌트의 props가 바뀌지 않는다면, 리렌더링 하지 않도록 설정합니다.

   ```react
   import React from 'react';
   import {
     MdCheckBoxOutlineBlank,
     MdCheckBox,
     MdRemoveCircleOutline
   } from 'react-icons/md';
   import cn from 'classname'
   import './TodoListItem.scss';

   const TodoListItem = ({todo, onRemove, onToggle}) => {
     const {id, text, checked} = todo;

     return (
       <div className="TodoListItem">
         <div className={cn('checkbox', {checked})} onClick={()=> onToggle(id)}>
           {checked ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
           <div className="text"> {text} </div>

         </div>
         <div className="remove" onClick={() => onRemove(id)}>
           <MdRemoveCircleOutline />
         </div>
         <p>{checked}</p>

       </div>
     );
   };

   export default React.memo(TodoListItem);

   ```

   props가 변경되지 않을 때 리렌더링하지 않을 컴포넌트이다. 해당 컴포넌트를 export할 때 컴포넌트를 React.memo에 담아서 내보낸다.

6. onToggle, onRemove가 변하지 않도록 만들기

   현재 onToggle과 onRemove는 아래에 보이는 것과 같이 todos를 참조하기 때문에 todos의 값이 바뀔때마다 변하게 되어 모든 TodoListItem 컴포넌트가 리렌더링 된다.

   ```react
     const onRemove = useCallback(
       id => {
         setTodos(todos.filter(todo => todo.id !== id))
       },
       [todos]
     )

     const onToggle = useCallback(
       id => {
         setTodos(todos.map(todo => (
           todo.id === id ? {...todo, checked: !todo.checked} : todo
         )))
       },
       [todos]
     )
   ```

   이를 해결하는 방법은 두가지가 있다.

   1. useState의 함수형 업데이트
   2. useReducer

   6.1. useState의 함수형 업데이트

   setState의 함수값으로 어떤 값을 넣지 않고, 기존 state를 변환시켜주는 함수를 매개변수로 넣을 수 있다.

   ```react
   cosnt [number, setNumber] = useState(0);
   const onIncrease = useCallback(
   	() => setNumber(prevNumber => prevNumber + 1),
   	[],
   );
   ```

   이를 적용하면 onToggle, onRemove에서 todos를 직접 사용하지 않기 때문에 todos가 변하더라도 TodoListItem가 리렌더링 되지 않는다.(해당 id에 해당하는 컴포넌트만 리렌더링 된다.)

   ```react
     const onRemove = useCallback(
       id => {
         setTodos(todos => todos.filter(todo => todo.id !== id))
       },
       []
     )

     const onToggle = useCallback(
       id => {
         setTodos(todos => todos.map(todo => (
           todo.id === id ? {...todo, checked: !todo.checked} : todo
         )))
       },
       []
     )
   ```

   이 방법을 사용했을 떄 34ms로 성능이 크게 향상되었다.

   6.2. useReducer

   ```react
   import React, {useRef, useState, useCallback, useReducer } from 'react';
   import TodoInsert from './components/TodoInsert';
   import TodoList from './components/TodoList';
   import TodoTemplate from './components/TodoTemplate';

   function createBulkTodos() {
     const array = [];
     for (let i = 0; i <=2500; i++) {
       array.push({
         id: i,
         text: `할 일  ${i}`,
         checked: false
       });
     }
     return array
   }

   function todoReducer (todos, action) {
     switch (action.type) {
       case 'INSERT':
         return todos.concat(action.todo);
       case 'REMOVE':
         return todos.filter(todo => todo.id !== action.id);
       case 'TOGGLE':
         return todos.map(todo => todo.id === action.id ? {...todo, checked : !todo.checked}: todo);
       default:
         return todos;
     }
   }
   const App = () => {
     const [todos, dispatch] = useReducer(todoReducer, undefined, createBulkTodos);
     // 원래 useReducer의 두번째 매개변수에 초기 state가 들어가는게 맞지만, 리렌더링 할 때마다 함수를 실행하게 되는 문제가 있다.
     // 위와 같은 방법으로 세번째에 함수를 참조하면 초기 렌더링 시에만 함수가 실행되게 할 수 있다.

     const nextId = useRef(2501);

     const onInsert = useCallback(text => {
       const todo = {
         id: nextId.current,
         text,
         checked:false
       };
       dispatch({type:'INSERT', todo});
       nextId.current +=1;
     }, []);

     const onRemove = useCallback(id => {
       dispatch({type:'REMOVE', id})
     }, [])

     const onToggle = useCallback(id => {
       dispatch({type:'TOGGLE', id})
     }, [])
     return (
       <TodoTemplate>
         <TodoInsert onInsert={onInsert} />
         <TodoList onRemove={onRemove} onToggle={onToggle} todos={todos}/>
       </TodoTemplate>
     )
   };

   export default App;
   ```

   이런 방식으로도 성능을 향상시킬 수 있다. 35ms 걸렸다.

   (리액트훅을 다루는 것이 아직 익숙치 않다. 리액트hook을 따로 공부한 다음 포스팅을 올려야겠다.)

7. react-virtualized를 사용한 렌더링 최적화

   현재 화면에 나타나는 항목수는 7개이지만 모든 항목이 렌더링 된다는 문제가 있다.

   React-virtualized를 활용하면 스크롤을 통해 보이기전인 컴포넌트는 렌더링하지 않게 만들 수 있다.

   ```react
   //TodoList.js

   import React, { useCallback } from 'react';
   import { List } from 'react-virtualized';
   import TodoListItem from './TodoListItem';
   import './TodoList.scss';

   const TodoList = ({todos, onRemove, onToggle}) => {
     const rowRenderer = useCallback(
       ({index, key, style}) => {
         const todo = todos[index];
         return (
           <TodoListItem
             todo = {todo}
             key = {key}
             onRemove = {onRemove}
             onToggle = {onToggle}
             style = {style}
           />
         )
       },
       [onRemove, onToggle, todos]
     )
     return (
       <List
         className="TodoList"
         width={512}
         height={513}
         rowCount={todos.length}
         rowHeight={65}
         rowRenderer={rowRenderer}
         list={todos}
         style={{outline: 'none'}}
       />
     );
   };

   export default TodoList;
   ```

   {index, key, style}을 매개변수로 받고 리스트의 행을 리턴하는 rowRerenderer라는 함수를 정의한다.

   그 다음 컴포넌트는 해당요소의 width와 height, 전체 행의 개수(rowCount), 각 행의 높이(rowHeight), eowRerenderer 함수, 전체 list 를 property로 입력한다.

   eact-virtualized를 사용했을 때 5.46ms까지 성능이 향상되었다.
