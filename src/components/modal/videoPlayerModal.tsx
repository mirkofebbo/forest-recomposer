// https://mui.com/material-ui/react-modal/#basic-modal
import { Typography, Box, Modal, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",

  width: "90vw",
  maxWidth: 800,

  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,

  p: 2,

  outline: "none",
};

export default function VideoPlayerModal({
  open,
  videoId,
  onClose,
}: {
  open: boolean;
  videoId?: string;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Video Preview
          </Typography>

          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Video content area */}
        <Box
          sx={{
            width: "100%",
            aspectRatio: "16 / 9",
            bgcolor: "black",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {videoId ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "grid",
                placeItems: "center",
                color: "white",
                opacity: 0.8,
              }}
            >
              No video selected
            </Box>
          )}
        </Box>

        {/* Optional extra info */}
        <Typography sx={{ mt: 1, fontSize: 14, opacity: 0.75}}>
          Video ID: {videoId ?? "none"}
        </Typography>
      </Box>
    </Modal>
  );
}
