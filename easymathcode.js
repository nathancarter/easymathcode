
function D ( id )
{
    return document.getElementById( id );
}

function showSource ()
{
    var L = D( 'left' );
    var R = D( 'right' );
    L.style.display = 'block';
    R.style.display = 'none';
    L.style.width = '100%';
}

function showHTML ()
{
    var L = D( 'left' );
    var R = D( 'right' );
    R.style.display = 'block';
    L.style.display = 'none';
    R.style.width = '100%';
}

function showBoth ()
{
    var L = D( 'left' );
    var R = D( 'right' );
    L.style.display = 'block';
    R.style.display = 'block';
    L.style.width = '50%';
    R.style.width = '50%';
}

function handleSage ( element )
{
    var all = element.getElementsByTagName( 'pre' );
    var len = all.length;
    for ( var i = 0 ; i < len ; i++ ) {
        var pre = all[i];
        var child = pre.childNodes[0];
        if ( !child || ( child.tagName != 'CODE' ) )
            continue;
        var inside = child.textContent;
        var m = /^#(#?)\s*(\w+)\s*\n/.exec( inside );
        if ( !m ) {
            hljs.highlightBlock( pre );
            continue;
        }
        if ( m[1] != '' )
            child.textContent = inside.substring( m[0].length );
        if ( m[2] == 'sagecell' ) {
            var newCell = document.createElement( 'div' );
            newCell.setAttribute( 'class', 'sage' );
            newCell.innerHTML = '<pre></pre>';
            newCell.childNodes[0].textContent = child.textContent;
            pre.parentNode.insertBefore( newCell, pre );
            pre.parentNode.removeChild( pre );
            sagecell.makeSagecell(
                { "inputLocation" : ".sage" } );
        } else {
            pre.className = ( pre.className ?
                              pre.className + ' ' : '' ) + m[1];
            hljs.highlightBlock( pre );
        }
    }
}

function refresh ()
{
    if ( ( D( 'source' ).style.display == 'none' )
      || ( D( 'output' ).style.display == 'none' ) )
        return;
    var next = D( 'source' ).value;
    if ( next != window.lastSource ) {
        D( 'dnld' ).setAttribute(
            'href', 'data:text/plain;charset=utf-8,'
                  + encodeURIComponent( next ) );
        D( 'output' ).innerHTML =
            window.showdownConverter.makeHtml( next );
        handleSage( D( 'output' ) );
        MathJax.Hub.Queue( [ "Typeset", MathJax.Hub ] );
        window.lastSource = next;
    }
}

function currentIndentation ()
{
    var S = D( 'source' );
    var pos = S.selectionStart;
    var text = S.value;
    var indent = 0;
    while ( ( pos > 0 ) && ( text[pos-1] != '\n' ) ) {
        pos--;
        if ( text[pos] == ' ' ) indent++; else indent = 0;
    }
    return indent;
}

function typeText ( text )
{
    var S = D( 'source' );
    var start = S.selectionStart;
    var end = S.selectionEnd;
    S.value = S.value.substring( 0, start )
            + text + S.value.substring( end );
    S.selectionStart = S.selectionEnd = start + text.length;
}

function keypressHandler ( event )
{
    if ( event.keyCode == 13 ) { // enter
        var spaces = '';
        var need = currentIndentation();
        while ( spaces.length < need ) spaces += ' ';
        typeText( '\n' + spaces );
        event.preventDefault();
    }
}

function keydownHandler ( event )
{
    if ( event.keyCode == 9 ) { // tab
        typeText( '    ' );
        event.preventDefault();
    }
}

function fileChosen ( event )
{
    if ( !window.File || !window.FileReader
      || !window.FileList || !window.Blob ) {
        alert( 'Your browser doesn\'t support that. :(' );
        return;
    }
    if ( event.target.files.length != 1 )
        alert( 'Something went wrong.' );
    var reader = new FileReader();
    reader.onload = function ( event ) {
        D( 'source' ).value = event.target.result;
    };
    reader.readAsText( event.target.files[0] );
}

function downloadHTML ( event )
{
    var data = window.showdownConverter.makeHtml(
        D( 'source' ).value );
    data = '<html>\n'
         + '  <head>\n'
         + '    <link rel="stylesheet" href="highlight.css">\n'
         + '    <link rel="stylesheet" href="main.css">\n'
         + '    <link rel="stylesheet" href="normalize.css">\n'
         + '    <script type="text/javascript"\n'
         + '            src="showdown.js"></script>\n'
         + '    <script type="text/x-mathjax-config">\n'
         + '        MathJax.Hub.Config( {\n'
         + '          tex2jax: { inlineMath: [\n'
         + '            [ "$", "$" ], [ "\\\\(", "\\\\)" ] ] },\n'
         + '          showProcessingMessages : false\n'
         + '        } );\n'
         + '    </script>\n'
         + '    <script type="text/javascript"\n'
         + '            src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>\n'
         + '    <script src="https://sagecell.sagemath.org/static/jquery.min.js"></script>\n'
         + '    <script src="https://sagecell.sagemath.org/static/embedded_sagecell.js"></script>\n'
         + '    <script src="highlight.pack.js"></script>\n'
         + '    <script type="text/javascript"\n'
         + '            src="./easymathcode.js"></script>\n'
         + '  </head>\n'
         + '  <body style="padding: 1em;">\n'
         + data + '\n'
         + '  <script>\n'
         + '      handleSage( document.body );\n'
         + '  </script>\n'
         + '  </body>\n'
         + '</html>';
    var blob = new Blob( [ data ], { type : 'text/html' } );
    var link = document.createElement( 'a' );
    link.setAttribute( 'href', URL.createObjectURL( blob ) );
    link.setAttribute( 'download', 'mymath.html' );
    link.click();
}

function setup ()
{
    D( 'source' ).onkeydown = keydownHandler;
    D( 'source' ).onkeypress = keypressHandler;
    D( 'dnld2' ).onclick = downloadHTML;
    window.lastSource = '';
    window.showdownConverter = new Showdown.converter({});
    refresh();
    setInterval( refresh, 1000 );
    document.getElementById( 'files' ).addEventListener(
        'change', fileChosen );
}

