import { createContext, useContext, useState } from "react";
import { useCookies } from "react-cookie";


const StateContext = createContext({

    user: null,
    token: null,
    role: null,
    userID: null,
    setUser: () => {},
    setToken: () => {},
    setRole: () => {},
    setUserID: () => {}
});


export const ContextAPI = ({children}) => {

    const [cookies, removeCookie, remove, setCookie] = useCookies(['?sessiontoken', 'userrole']);
    //defining functions for state
    const [user, setUser] = useState({});
    const [userID, _setUserID] = useState(localStorage.getItem('?id'));
    const [token, _setToken] = useState(localStorage.getItem('?sessiontoken'));
    // const [token, setToken] = useState({});
    const [role, _setRole] = useState(localStorage.getItem('?role'));
    // const [role, _setRole] = useState(localStorage.getItem('USER_ROLE'));
    //separate function for accepting tokens, this is where we validate and save tokens into local storage

    const setToken = (token) => {
        _setToken(token);
        if (token) {
            //checks if the token exist and if exist store it into the local storage
            sessionStorage.setItem('?sessiontoken', token);
            
        } else {
            //on the other hand, if it does not exist therefore there is no access
            sessionStorage.removeItem('?sessiontoken');
            sessionStorage.removeItem('USER_ROLE');


        }
    };

    const setUserID = (userID) => {
        _setUserID(userID)

        if(userID) {
            sessionStorage.setItem('?id', userID);

        }else {
            sessionStorage.removeItem('?id', userID);
            
        }
    }

    const setRole = (role) => {
        _setRole(role)

        if(role) {
            sessionStorage.setItem('?role', role);

        }else {
            sessionStorage.removeItem('?role', role);
            
        }
    }

    return (
        // the value is from the functions above, setToken function is being used rather than the setStudToken because
        //setToken is the one who haves the value for setStudToken and also checks if that student token exists
        <StateContext.Provider
            value={{
             
                user,
                token,
                role,
                userID,
                setUser,
                setToken,
                setRole,
                setUserID
            }}
        >
            {children}
        </StateContext.Provider>
    );
}

export const useStateContext = () => useContext(StateContext);

