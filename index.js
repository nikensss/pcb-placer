// sets the priority prefixes and their sort order (others are sorted alphabetically)
var priorityPrefixes = ['R', 'C', 'D', 'L', 'D', 'Q', 'IC'].reverse();
// attributes to be considered
var groupingAttributes = ['precision', 'voltage', 'esr'];

function cssTransform(elem) {
  // convert a .brd rot attribute to a css transform directive
  var css = '';
  var x = elem.attr('x');
  var y = elem.attr('y');
  var dx = elem.attr('dx');
  var dy = elem.attr('dy');
  var drill = elem.attr('drill');
  var radius = elem.attr('radius');
  var rot = elem.attr('rot');
  if (dx != null) {
    css += ' translateX(' + (parseFloat(dx) * -0.5).toString() + 'mm)';
  }
  if (dy != null) {
    css += ' translateY(' + (parseFloat(dy) * 0.5).toString() + 'mm)';
  }
  if (drill != null) {
    css +=
      ' translate(' +
      (parseFloat(drill) * -0.5).toString() +
      'mm, ' +
      (parseFloat(drill) * 0.5).toString() +
      'mm)';
  } else if (radius != null) {
    css +=
      ' translate(' +
      (parseFloat(radius) * -1.0).toString() +
      'mm, ' +
      (parseFloat(radius) * 1.0).toString() +
      'mm)';
  } else if (rot != null) {
    if (rot.substring(0, 2) == 'MR') {
      css +=
        ' scaleX(-1.0) rotate(' +
        (-parseFloat(rot.substring(2))).toString() +
        'deg)';
    } else {
      css += ' rotate(' + (-parseFloat(rot.substring(1))).toString() + 'deg)';
    }
  }
  if (css != '') {
    css = 'transform:' + css + '; -webkit-transform:' + css + ';';
  }
  if (x != null) {
    css += ' left:' + x + 'mm;';
  }
  if (y != null) {
    css += ' bottom:' + y + 'mm;';
  }
  if (dx != null) {
    css += ' width: ' + dx + 'mm;';
  }
  if (dy != null) {
    css += ' height: ' + dy + 'mm;';
  }
  if (drill != null) {
    css += ' width: ' + drill + 'mm; height: ' + drill + 'mm;';
  } else if (radius != null) {
    css +=
      ' width: ' +
      (parseFloat(radius) * 2.0).toString() +
      'mm; height: ' +
      (parseFloat(radius) * 2.0).toString() +
      'mm;';
  }
  return css;
}

function displayBoard(data) {
  console.log({ data });
  const pcb = $('#pcb');
  const partslist = $('#partslist');
  const allClasses = [];
  var bx0 = 0;
  var by0 = 0;
  var bx1 = 0;
  var by1 = 0;
  $(data)
    .find('board > plain > wire[layer=20]')
    .each(function (index) {
      //console.log( '  '+index + ": " + $(this).attr("layer") );
      var x = parseFloat($(this).attr('x1'));
      var y = parseFloat($(this).attr('y1'));
      bx0 = Math.min(bx0, x);
      by0 = Math.min(by0, y);
      bx1 = Math.max(bx1, x);
      by1 = Math.max(by1, y);
      x = parseFloat($(this).attr('x2'));
      y = parseFloat($(this).attr('y2'));
      bx0 = Math.min(bx0, x);
      by0 = Math.min(by0, y);
      bx1 = Math.max(bx1, x);
      by1 = Math.max(by1, y);
    });
  if (bx1 <= bx0) {
    alert('Board dimensions error');
  }
  pcb.css('left', bx0.toString() + 'mm');
  pcb.css('top', (by0 + 2).toString() + 'mm');
  // pcb.css('margin-top', '2mm');

  const width = bx1 - bx0;
  const height = by1 - by0;
  const ratio = width / height;

  const finalWidth = parseFloat($('.w-4').css('width'));
  const finalHeight = Math.ceil(finalWidth / ratio);

  // pcb.css('width', finalWidth.toString() + 'px');
  // pcb.css('height', finalHeight.toString() + 'px');
  pcb.css('width', width + 'mm');
  pcb.css('height', height + 'mm');

  $('#flip-board').css(
    'top',
    parseInt(pcb.css('height')) +
      parseInt($('#flip-board').css('height')) +
      'px'
  );

  $(data)
    .find('element')
    .each(function (index) {
      const element = this;
      console.log({ element });
      const name = $(element).attr('name');
      const rot = $(element).attr('rot');
      var mirrored = rot != null && rot.substring(0, 1) == 'M';

      //console.log( index + ": " + name );

      $(data)
        .find('package[name="' + $(element).attr('package') + '"]')
        .each(function (index) {
          var package = this;
          //console.log( '  '+index + ": " + $(package).attr("name") );
          var elemCode =
            '<div name="' +
            name +
            '" class="element" style="position:absolute; ' +
            cssTransform($(element)) +
            '">';
          var x0 = 0;
          var y0 = 0;
          var x1 = x0;
          var y1 = y0;

          $(package)
            .children('smd')
            .each(function () {
              var smd = this;
              //console.log( '    '+index + ": " + $(smd).attr("name") );
              elemCode +=
                '<div name="' +
                name +
                '.' +
                $(smd).attr('name') +
                '" class="smd' +
                (mirrored ? ' mirrored' : '') +
                '" style="position:absolute; ' +
                cssTransform($(smd)) +
                '"></div>';
              var x = parseFloat($(smd).attr('x'));
              var y = parseFloat($(smd).attr('y'));
              var dx = parseFloat($(smd).attr('dx'));
              var dy = parseFloat($(smd).attr('dy'));
              var rot = $(smd).attr('rot');
              if (rot == 'R90' || rot == 'R270') {
                [dx, dy] = [dy, dx];
              }
              if (x - dx * 0.5 < x0) {
                x0 = x - dx * 0.5;
              }
              if (y - dy * 0.5 < y0) {
                y0 = y - dy * 0.5;
              }
              if (x + dx * 0.5 > x1) {
                x1 = x + dx * 0.5;
              }
              if (y + dy * 0.5 > y1) {
                y1 = y + dy * 0.5;
              }
            });
          $(package)
            .children('pad')
            .each(function () {
              var pad = this;
              //console.log( '    '+index + ": " + $(pad).attr("name") );
              elemCode +=
                '<div name="' +
                name +
                '.' +
                $(pad).attr('name') +
                '" class="pad' +
                (mirrored ? ' mirrored' : '') +
                '" style="position:absolute; ' +
                cssTransform($(pad)) +
                '"></div>';
              var x = parseFloat($(pad).attr('x'));
              var y = parseFloat($(pad).attr('y'));
              var drill = parseFloat($(pad).attr('drill'));
              if (x - drill * 0.5 < x0) {
                x0 = x - drill * 0.5;
              }
              if (y - drill * 0.5 < y0) {
                y0 = y - drill * 0.5;
              }
              if (x + drill * 0.5 > x1) {
                x1 = x + drill * 0.5;
              }
              if (y + drill * 0.5 > y1) {
                y1 = y + drill * 0.5;
              }
            });
          $(package)
            .children("circle[layer='21']")
            .each(function () {
              var circle = this;
              elemCode +=
                '<div class="circle' +
                (mirrored ? ' mirrored' : '') +
                '" style="position:absolute; ' +
                cssTransform($(circle)) +
                '"></div>';
            });

          var props = {
            prefix: /[A-Za-z]+/.exec(name).toString(),
            package: $(package).attr('name'),
            valstr: $(element).attr('value').replace(/ /g, ''),
            attrs: {}
          };
          props.value = /[-]?[0-9]*[.]?[0-9]*/.exec(props.valstr).toString();
          props.unit =
            props.value === ''
              ? null
              : props.valstr.substring(props.value.length);
          props.value = parseFloat(props.value);
          props.scale =
            props.unit === null ? null : /[pnumkMGT]/.exec(props.unit);
          props.scale = props.scale == null ? null : props.scale.toString();
          props.valueScaled =
            props.scale === null
              ? props.value
              : {
                  p: 1e-12,
                  n: 1e-9,
                  u: 1e-6,
                  m: 1e-3,
                  k: 1e3,
                  M: 1e6,
                  G: 1e9,
                  T: 1e12
                }[props.scale] * props.value;

          var classes =
            props.prefix + ': ' + props.package + ' ' + props.valstr;

          $(element)
            .children('attribute')
            .each(function () {
              var attrName = $(this).attr('name').toLowerCase();
              var attrValue = $(this).attr('value');
              if (groupingAttributes.indexOf(attrName) >= 0) {
                classes += ' ' + attrValue;
                props.attrs[attrName] = attrValue;
              }
            });

          //console.log(props);

          if (x1 > x0) {
            elemCode +=
              '<div class="part' +
              (mirrored ? ' mirrored' : '') +
              '" title="' +
              name +
              ': ' +
              classes +
              '"' +
              ' style="position: absolute; left:' +
              x0.toString() +
              'mm; bottom:' +
              y0.toString() +
              'mm; width:' +
              (x1 - x0).toString() +
              'mm; height:' +
              (y1 - y0).toString() +
              'mm;"></div>';
            var classesCode =
              '_' +
              encodeURI(classes.replace(/ /g, '__'))
                .replace('%', '--')
                .replace('%', '--')
                .replace('.', '_')
                .replace(',', '_')
                .replace('/', '_')
                .replace(':', '_')
                .replace(':', '_');
            if (!mirrored) {
              allClasses[classesCode] = props;
            }
            elemCode = elemCode.replace(
              'class="element"',
              'class="element ' + classesCode + '"'
            );
          }
          elemCode += '</div>';
          pcb.append(elemCode);
        });
    });

  keysSorted = Object.keys(allClasses).sort(function (a, b) {
    a = allClasses[a];
    b = allClasses[b];
    if (a.prefix !== b.prefix) {
      var priority =
        priorityPrefixes.indexOf(a.prefix) - priorityPrefixes.indexOf(b.prefix);
      if (priority !== 0) {
        return priority > 0 ? -1 : 1;
      }
      return a.prefix < b.prefix ? -1 : 1;
    }
    if (a.package !== b.package) {
      return a.package < b.package ? -1 : 1;
    }
    if (isNaN(a.valueScaled) !== isNaN(b.valueScaled)) {
      return isNaN(a.valueScaled) - isNaN(b.valueScaled);
    }
    if (a.valueScaled !== b.valueScaled) {
      return a.valueScaled - b.valueScaled;
    }
    if (a.attrs.toString() !== b.attrs.toString()) {
      return a.attrs.toString() < b.attrs.toString() ? -1 : 1;
    }
    return 0;
  });
  var l = keysSorted.length;
  for (let index = 0; index < l; index++) {
    //console.log(index+':'+keysSorted[index]+'::'+allClasses[keysSorted[index]]);
    var element = allClasses[keysSorted[index]];
    var ids = [];
    $('.' + keysSorted[index]).each(function () {
      var name = $(this).attr('name');
      if (ids.indexOf(name) < 0) {
        ids.push(name);
      }
    });
    ids.sort(function (a, b) {
      aprefix = /[A-Za-z]+/.exec(a).toString();
      bprefix = /[A-Za-z]+/.exec(b).toString();
      if (aprefix != bprefix) {
        return aprefix < bprefix ? -1 : 1;
      }
      return (
        parseInt(a.substring(aprefix.length)) -
        parseInt(b.substring(bprefix.length))
      );
    });
    var li = $('<tr class="li"></tr>');
    li.attr('name', keysSorted[index]);
    li.append(
      '<td class="numeric">' +
        index +
        '</td>' +
        '<td>' +
        element.prefix +
        '</td>' +
        '<td>' +
        element.package +
        '</td>' +
        '<td' +
        (isNaN(element.value) ? '' : ' class="numeric"') +
        '>' +
        element.valstr +
        '</td>' +
        '<td>' +
        Object.keys(element.attrs)
          .map(function (key) {
            return element.attrs[key];
          })
          .join(' ') +
        '</td>' +
        '<td>' +
        ids.join(', ') +
        '</td>' +
        '<td class="numeric">' +
        ids.length +
        '</td>'
    );
    li.click(function () {
      // deselect all
      $('.part').removeClass('hilite');
      $('.li').removeClass('hilite');
      var name = $(this).attr('name');
      $('.' + name + ' > .part').addClass('hilite');
      $(this).addClass('hilite');
    });
    partslist.append(li);
  }
  $('.part').click(function () {
    var classes = $(this).parent().attr('class').split(' ');
    var li = $('.li[name=' + classes[1] + ']');
    li.click();
    var pos = li.offset();
    var top = pos.top - $(window).height() + li.height();
    var left = pos.left - 20;
    window.scrollTo(left < 0 ? 0 : left, top < 0 ? 0 : top);
  });

  $('.pcb-view.hide').removeClass('hide');
}

$(document).ready(function () {
  $('#xmlfile').change(function () {
    const inputFiles = $(this).prop('files');
    if (inputFiles.length === 0) return;

    const filename = inputFiles[0].name;

    $('#filename-display').text(`Viewing: ${filename}`);

    const fr = new FileReader();

    fr.onload = function () {
      displayBoard($.parseXML(fr.result));
    };

    fr.readAsText(inputFiles[0]);
  });

  $.ajax({
    url: 'board.brd',
    dataType: 'xml'
  }).done(displayBoard);
});
