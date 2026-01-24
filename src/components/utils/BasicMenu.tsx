// https://mui.com/material-ui/react-menu/
import * as React from 'react';
import { Button, Menu, MenuItem, Box} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export default function BasicMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <Button
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <MenuIcon />
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            'aria-labelledby': 'basic-button',
          },
        }}
      >
        <MenuItem onClick={handleClose}>
          <InfoOutlineIcon sx={{ marginRight: "5px" }} />
          Information
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <SlideshowIcon sx={{ marginRight: "5px" }} />
          View
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <EditIcon sx={{ marginRight: "5px" }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <DeleteIcon sx={{ marginRight: "5px" }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
