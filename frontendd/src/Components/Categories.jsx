import { List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import React from 'react'

const Categories = ({categoryCount}) => {
    
const styles = {
    root: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundImage: `url("../src/assets/shopGraffiti.png")`,
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
    },
    content: {
        flexGrow: 1,
        height: '100%',
        marginTop: '50px',
        paddingBottom: '50px',
        overflowY: 'auto',
    },
    mainContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        marginTop: '20px'
    },
    searchInput: {
        width: '100%',
        height: '56px',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        marginRight: '20px',
        backgroundColor: '#FFFFFF',
        borderRadius: '10px',
    },
    card: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '10px 5px 20px rgba(0, 0, 0, 0.25)',
        borderRadius: '20px',
        margin: '10px',
        marginBottom: '20px',
        height: '100%', 
        marginTop: '-10px'
    },
    cardContent: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    cardImage: {
        height: 250,
        width: '100%',
        objectFit: 'cover',
    },
    modalContent: {
        width: '100%',
        height: 'calc(100% - 64px)',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        marginTop: '-3.4%',
    },
    stickyCategories: {
        position: 'sticky',
        top: '70px',
        zIndex: 1,
        background: 'linear-gradient(to right, #E9E9E9  , #F6F6F6)',
        borderRadius: '15px',
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: '10px'
     
    },
};

const categories = [
    { name: 'All', icon: <img src='../src/assets/all.png' alt='icon' style={{ width: '35px', height: '35px' }}/>},
    { name: 'T-shirts', icon: <img src='../src/assets/shirt.png' alt='icon' style={{ width: '35px', height: '35px' }}/> },
    { name: 'Shorts', icon: <img src='../src/assets/short.png' alt='icon' style={{ width: '35px', height: '35px' }}/> },
    { name: 'Caps', icon: <img src='../src/assets/cap.png' alt='icon' style={{ width: '35px', height: '35px' }}/> },
    { name: 'Hoodies', icon: <img src='../src/assets/hoodie.png' alt='icon' style={{ width: '35px', height: '35px' }}/>},
];
  return (
    <div>
        <Typography
            gutterBottom
            variant="h6"
            component="div"
            sx={{ fontFamily: "Kanit", fontWeight: "bold", textAlign: "left", color: "black", fontSize: 30, position: 'sticky' }}
            >
            CATEGORIES

        </Typography>
        <div style={styles.stickyCategories}>
        <List>
        {categories.map((category, index) => (
            <ListItem button key={index}>
            <ListItemIcon>
                {category.icon}
            </ListItemIcon>
            <ListItemText
                primary={
                    <Typography
                        gutterBottom
                        variant="h6"
                        component="div"
                        onClick={() => {
                            console.log(category.name);
                        }}
                        sx={{ fontFamily: "Inter", fontWeight: "bold", textAlign: "left", color: "black", fontSize: 20 }}
                    >
                        {category.name}
                    </Typography>
                }
            />
                </ListItem>
        ))}
        </List>
        </div>
    </div>
  )
}

export default Categories