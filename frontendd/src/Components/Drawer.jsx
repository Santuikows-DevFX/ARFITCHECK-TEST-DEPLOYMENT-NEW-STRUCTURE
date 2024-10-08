import React from 'react';

const DrawerContent = ({ listItems, selectedItem, handleListItemClick }) => (
  <List sx={{ backgroundColor: "black" }}>
    {listItems.map((item) => (
      <ListItem
        key={item.key}
        sx={{ "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.08)" } }}
        button
        selected={selectedItem === item.key}
        onClick={() => handleListItemClick(item.key)}
      >
        <Typography sx={{ fontFamily: "Kanit", fontSize: 20, fontWeight: "regular", color: "white" }}>
          {item.label}
        </Typography>
      </ListItem>
    ))}
  </List>
);

export default DrawerContent;