ffmpeg -i NavigateTo-Matthew-Neural.mp3 -i LaunchedDabbleImproving.wav \
-filter_complex '[0:0][1:0]concat=n=2:v=0:a=1[out]' \
-map '[out]' -f wav -