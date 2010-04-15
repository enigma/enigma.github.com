function initArray() {
    this.length = initArray.arguments.length;
    for (var i = 0; i < this.length; i++) {
        this[i] = initArray.arguments[i];
    }
}	
function from10toradix(value,radix){
    var retval = '';
    var ConvArray = new initArray(0,1,2,3,4,5,6,7,8,9,'A','B','C','D','E','F');
    var intnum;
    var tmpnum;
    var i = 0;

    //intnum = parseInt(value,10); alert(intnum);
    intnum = value;
    if (isNaN(intnum)){
        retval = 'NaN';
    }else{
        while (intnum > 0.9){
            i++;
            tmpnum = intnum;
            // cancatinate return string with new digit:
            retval = ConvArray[tmpnum % radix] + retval;  
            intnum = Math.floor(tmpnum / radix); //alert("Int: " + intnum + " Tmp:" + tmpnum);
            if (i > 100){
                // break infinite loops
                retval = 'NaN';
                break;
            }
        }
    }
    return retval;
}
$(document).ready(function(){
    var id = "#calmask";
    var days = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", 
                "Sabato"];
    var hour = 0;
    $(id).append(' <ol id="selectable"> </ol>');
    id = "#selectable";
    
    $(id).append('  <li class="calmask_box_sys">Ora</li>');
    for (var i=0; i < days.length; i++) {
        $(id).append('  <li class="calmask_box_sys">'+ days[i]+'</li>');
    }
    
    for (var j=8; j < 20; j++) {
        $(id).append('  <li class="calmask_box_sys">'+j+'-'+(j+1)+'</li>');
        for (var k=0; k < 6; k++) {
            //$(id).append('  <li class="calmask_box ui-widget-content">'+(hour++)+'</li>');
            $(id).append('  <li class="calmask_box ui-widget-content" id="calmask_item'+(hour++)+'"></li>');
        }
    }
    
    $( ".calmask_box_sys" ).selectable( { disabled: true } );       
    $(id).selectable({
        stop: function(event, ui) {
            Load(base, 1);
            var repr = Save(); //alert("Array: " + repr);
            
            //repr = intFromArray(repr); //alert("Int: " + repr);
            //repr = from10toradix(repr, 16); //alert("Hex: " + repr);
            
            repr = formatFromArray(repr);
            $('#calmask_sign').val(repr);
        }
    });
    
    var Load = function(data, mod) {
        for(i=0; i < data.length; i++) {
                if ((mod >= 0) && (data[i] === 1)) { $("#calmask_item"+i).addClass("ui-selected"); }
                else if (mod <= 0) { $("#calmask_item"+i).removeClass("ui-selected"); }
        }
    };
    
    var Save = function () {
        var data = new Array();
        for(i = 0; i<hour; i++) {
            if ($('#calmask_item'+i).hasClass('ui-selected')) {
                data.push(1);
            } else { data.push(0); }
            
        }
        return data;
    };
    
    var intFromArray = function(data) {
        s = '';
        for(i = 0; i<data.length; i++) {
            s += data[i];
        }
        return parseInt(s, 2);
    };
    var arrayFromInt = function(n) {
        var bin = from10toradix(n, 2);
        while(bin.length < hour) {
            bin = '0' + bin;
        }
        var data = new Array();
        for(i = 0; i<bin.length; i++) {
            data.push(parseInt(bin[i],2));
        }
        return data;
    };
    
    var formatFromArray = function(data) {
        var s = '';
        for(i = 0; i<data.length; i++) {
            s += data[i];
        }
        
        return formatFromString(s);
    };
    
    var formatFromString = function(s) {
        while(s.length%4 !== 0) {
            s = '0' + s;
        }
        
        s1 = s.substr(0, s.length/2);
        s2 = s.substr(s.length/2, s.length/2);
        
        s1 = parseInt(s1, 2);
        s2 = parseInt(s2, 2);
        
        s1 = from10toradix(s1, 16);
        s2 = from10toradix(s2, 16);
        
        while (s1.length < Math.ceil((s.length/2)/4)) { s1 = '0' + s1; }
        while (s2.length < Math.ceil((s.length/2)/4)) { s2 = '0' + s2; }
        
        return s1+'-'+s2;
    };
    
    var strFromFormat = function(format) {
        var s1 = format.replace('-','');
        var s = '';
        var tmp;
        for(i = 0; i< s1.length; i++) {
            tmp = from10toradix(parseInt(s1[i], 16), 2);
            while (tmp.length < 4) { tmp = '0' + tmp; }
            s += tmp;
        }
        while (s.length > hour) { s = s.substr(1, s.length); }
        return s;
    };
    
    var arrayFromStr = function(s) {
        var ret = new Array();
        for(i = 0; i< s.length; i++) {
            ret.push((s[i] === '0')?0:1);
        }
        return ret;
    };
    
    
    var base = arrayFromStr(strFromFormat('00000003F-249251041'));       
    Load(base, 0);
    $(".ui-selected").selectable({ disabled: true });
    
    $("#calmask_loadbtn").click(function () {
        var format = $('#calmask_sign').val();
        data = arrayFromStr(strFromFormat(format));
        $("li[id^='calmask_item']").text("").removeClass().addClass("calmask_box").addClass("ui-widget-content");
        Load(data, 0);
        Load(base, 1);
        
    });
    
    
    var createArrayMask = function(format_array) {
        var tot = format_array.length;
        var mask = arrayFromStr(strFromFormat(format_array[0]));
        var tmp;
        for(var i = 1; i< tot; i++) {
            
            tmp =  arrayFromStr(strFromFormat(format_array[i]));
            for(var j=0; j<tmp.length; j++) {
                mask[j] = mask[j] + tmp[j];
            }
        }
        for(var i = 0; i< mask.length; i++) {
            mask[i] = mask[i]/tot;
        }
        return mask;
    }
    
    var arrayMaskFromStr = function(s) {
        return createArrayMask(s.split('\n'));
    }
    
    var applyMask = function(prefix, mask) {
        for(var i = 0; i< mask.length; i++) {
            style = parseInt(10-mask[i]*10);
            var val = ''+(100-mask[i]*100);
            val = Math.round(val)+'%';
            $("#"+prefix+i).removeClass().addClass("mask"+style).text(val);
        }
    }
    
    $('#calmask_maskbtn').click(function() {
        var arrayMask = arrayMaskFromStr($('#calmask_mask_textarea').val());
        applyMask("calmask_item", arrayMask);
        
    });
    
    
});
