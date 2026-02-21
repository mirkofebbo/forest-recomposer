// https://mui.com/material-ui/react-menu/
import { useState } from 'react';
import type { Dispatch, SetStateAction, MouseEvent } from "react";
import { Button, Menu, MenuItem, Box } from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import type { Manifest } from "../../types";

export default function BasicMenu({ itemId, manifestData, setManifestData, setShowInfo, onOpenVideoModal }:
  {
    itemId?: string,
    manifestData?: Manifest,
    setManifestData?: Dispatch<SetStateAction<Manifest>>,
    setShowInfo?: Dispatch<SetStateAction<boolean>>,
    onOpenVideoModal: (videoId: string) => void
  }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const hendleInfo = () => {
    if (!itemId || !manifestData) return
    setShowInfo?.(true);
    handleClose();
  }

  const handleView = () => {
    if (!itemId) return;
    onOpenVideoModal(itemId);
    handleClose();
  }
  const handleEdit = () => {
    if (!itemId || !manifestData || !setManifestData) return;

    const itemToAdd =
      manifestData.to_edit.find((item) => item.videoId === itemId) ||
      manifestData.completed.find((item) => item.videoId === itemId);

    if (!itemToAdd) return;
    setManifestData({
      ...manifestData,
      in_progress: [
        itemToAdd,
      ],
    });

    handleClose();
  }

  const handleDelete = () => {
    if (!itemId || !manifestData || !setManifestData) return;

    setManifestData({
      ...manifestData,
      to_edit: manifestData.to_edit.filter((item) => item.videoId !== itemId),
      in_progress: manifestData.in_progress.filter((item) => item.videoId !== itemId),
      completed: manifestData.completed.filter((item) => item.videoId !== itemId),
    });

    handleClose();
  }

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
        <MenuItem onClick={hendleInfo}>
          <InfoOutlineIcon sx={{ marginRight: "5px" }} />
          Information
        </MenuItem>
        <MenuItem onClick={handleView}>
          <SlideshowIcon sx={{ marginRight: "5px" }} />
          View
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ marginRight: "5px" }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon sx={{ marginRight: "5px" }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
