export function Icon({name='building',size=21,...props}) {
  const paths={
    home:'M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
    building:'M4 21V7h6V3h10v18M2 21h20M7 10v1m0 3v1m6-9v1m4-1v1m-4 3v1m4-1v1m-4 3v1m4-1v1m-4 3v3',
    chat:'M21 11a8 8 0 0 1-8 8H7l-4 3v-6a8 8 0 1 1 18-5ZM8 10h8m-8 4h5',
    trial:'M9 3h6m-5 0v7L4 19a1.5 1.5 0 0 0 1 2h14a1.5 1.5 0 0 0 1-2l-6-9V3M8 15h8',
    card:'M3 5h18v14H3zM3 9h18M6 15h4',
    tasks:'M9 4H5v17h14V4h-4M9 3h6v4H9zM8 12l2 2 5-4m-7 8h7',
    chart:'M4 20h17M5 16v-5h3v5m3 0V7h3v9m3 0V3h3v13',
    users:'M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3m20 0v-3a4 4 0 0 0-3-4M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8m8 0a4 4 0 0 1 0 8',
    search:'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14m5 12 6 6',
    plus:'M12 4v16M4 12h16',close:'m6 6 12 12M6 18 18 6',arrow:'M20 12H4m6-6-6 6 6 6',
    download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',filter:'M3 4h18l-7 8v7l-4 2V12z',
    check:'m5 12 4 4L20 5',bell:'M18 8a6 6 0 0 0-12 0v7l-3 3h18l-3-3V8m-9 13h6',
    pin:'M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
    calendar:'M4 5h16v16H4zM8 2v6m8-6v6M4 10h16',menu:'M3 6h18M3 12h18M3 18h18',
    note:'M5 3h10l4 4v14H5zM14 3v5h5M8 12h8m-8 4h6',shield:'m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6zm-5 10 3 3 7-7',
    send:'m22 2-7 20-4-9-9-4zm0 0L11 13',clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18m0 4v6l4 2'
  };
  return <svg {...props} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]||paths.building}/></svg>;
}
export function Brand(){return <div className="brand"><svg width="58" height="52" viewBox="0 0 80 66" aria-hidden="true"><path d="M5 21C23 19 31 28 40 39 31 50 23 59 5 58Z" fill="#e8d2ae"/><path d="M75 21C57 19 49 28 40 39 49 50 57 59 75 58Z" fill="#af9069"/><path d="m40 2 10 10-10 10-10-10Z" fill="#d7c3a3"/></svg><b>لِقا</b><span lang="en">LIQA</span><small>تواصل. نمو. أثر.</small></div>}
