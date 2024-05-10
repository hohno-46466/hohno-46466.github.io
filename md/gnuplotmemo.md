# gnuplotで描画してみます

https://otepipi.hatenablog.com/entry/2019/04/09/214829 から引用


とりあえずチュートリアルに載っている簡単なグラフから

```gnuplot {cmd=true output="html"}
set terminal svg
set title "Simple Plots 4" font ",20"
set key left box
set samples 150
set style data points

plot [-10:10] sin(x),cos(x),atan(x),cos(atan(x))
```

```bash {cmd=true}
(LANG=C date)
pwd
ls -l | cat -n
```

VScode でこのファイルを開き、Markdownファイルのどこかの行にカーソルを合わせた状態で Ctrl + Shift + Enter を押すとコードチャンク内の全てのコードが実行されグラフが描画... されるはず


