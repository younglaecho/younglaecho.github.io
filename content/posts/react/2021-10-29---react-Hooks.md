---
title: react hooks
date: "2021-10-29T09:00:00.169Z"
template: "post"
draft: false
slug: "react-ref"
category: "react"
tags:
  - "react"
description: "리액트 hooks : hooks를 활용하여 함수형 컴포넌트 사용하기"
---

# Hooks

## useState

함수형 컴포넌트에서 가변적인 state를 지닐 수 있도록 해줌.

```javascript
const Counter = () => {
  const [value, setValue] = useState(0); 
}
```

state를 정의할 때 useState의 매개변수로 state의 값을 넣고, 배열 비구조화 할당을 통해 첫번째 배열원소에는 state의 변수명, 두번째 배열요소에는 상태를 정해줄 메소드 명을 넣음.

```javascript
... ... // 위의 코드에서 이어 적음
	return (
  	<div>
    	<p>
    		현재 카운터 값은 {value}입니다.
  		</p>
			<button onClick={()=> setValue(value+1)}>+1</button>
			<button onClick={()=> setValue(value-1)}>-1</button>
		</div>
  )
```



## useEffect

useEffect는 리액트 컴포넌트가 렌더링 될 때마다 특정 작업을 수행하도록 설정하는 Hook이다.

```javascript
import {useEffect} from 'react';

useEffect(()=> {
  console.log('렌더링이 완료되었습니다.')
})
```

사용방법은 위와 같이 첫번째 매개변수로 렌더링 되었을 때 실행시킬 콜백함수를 넣어준다.

```javascript
import {useEffect} from 'react';

useEffect(()=> {
  console.log('마운트 될때만 실행')
},[])
```

두번째 매개변수로 빈 배열이 들어가 있을 때는, 마운트 될때만 실행된다.

```javascript
import {useEffect} from 'react';

useEffect(()=> {
  console.log(name)
},[name])
```

두번째 매개변수에 배열을 넣으면, 배열의 원소의 값이 바뀔 때 실행되도록 할 수 있다.

```javascript
import {useEffect} from 'react';

useEffect(()=> {
  console.log(name)
  return () => {
    console.log('cleanup')
  }
},[name])
```

첫번째 매개변수로 들어가는 콜백함수에 return값으로 함수를 주면 언마운트 되기 직전이나 업데이트 되기 직전에 실행시킬 수 있다.



## useReducer

