/***** Required : http://fabricjs.com *****/
var CurvedText = (function() {
        
    /**
     * Constructor 
     * @method curvedText
     * @param canvas
     * @param {object} options
     */        
    function CurvedText( canvas, options ){           
      // Options 
      this.opts = options || {};      
      for ( prop in CurvedText.defaults ) { 
         if (prop in this.opts) { continue; }
         this.opts[prop] = CurvedText.defaults[prop];
      }      

      this.canvas = canvas;
      this.group = new fabric.Group([], {selectable: this.opts.selectable});
      this.canvas.add( this.group ) ;      
      this.setText( this.opts.text );
    };

    /**
     * @method set
     * @param {string} param
     * @param value
     * @return false if the param name is unknown 
     */     
    CurvedText.prototype.set = function( param, value ) {
      if ( this.opts[param] !== undefined ) {
        this.opts[param] = value;        
        if ( param == 'fontSize' || param == 'fontWeight' ) {
          this._setFontStyles();
        }
        if ( param == 'selectable' ) {
          this.group.selectable = value;
        }
        this._render();        
        return true;  
      } else {
        return false;
      }
    };    
    
    /** 
     * @method get
     * @param {string} param
     * @return value of param, or false if unknown 
     */      
    CurvedText.prototype.get = function( param ) {
      if ( this.opts[param] !== undefined ) {
        return this.opts[param];  
      } else {
        return false;
      }
    };    
    
    /**
     * @method getParams
     * @return {object} value of every options       
     */      
    CurvedText.prototype.getParams = function() {
      return this.opts;
    };
    
    /**
     * Center the group in canvas 
     * @method center
     * @return {object} with top and left     
     */      
    CurvedText.prototype.center = function() {
      this.opts.top = this.canvas.height / 2;
      this.opts.left = this.canvas.width / 2;
      this._render();
      return { top:this.opts.top,  left:this.opts.left };
    };
    
    /**
     * Remove all letters from canvas 
     * @method remove      
     */      
    CurvedText.prototype.remove = function() {
      var size = this.group.size();
      for ( var i=size; i>=0; i-- ){
        this.group.remove( this.group.item(i) );
        console.log( i ) ;
      }
      this.canvas.renderAll();
    };
    
    /**
     * Used to change the text 
     * @method setText
     * @param {string} newText
     */      
    CurvedText.prototype.setText = function( newText ) {

      while ( newText.length != 0 && this.group.size() >= newText.length ) {
        this.group.remove( this.group.item( this.group.size()-1 ) );
      }
      
      for ( var i=0; i<newText.length; i++ ){
        if ( this.group.item(i) == undefined ){
          var letter = new fabric.Text(newText[i], {
            selectable: true
          });
          this.group.add( letter );
        }
        else{
          this.group.item(i).text = newText[i];
        }    
      }
      this.opts.text = newText;
      this._setFontStyles();
      this._render();
    }; 
    
    /**
     * Update font size and weight    
     * @private
     * @method _setFontStyles
     */      
    CurvedText.prototype._setFontStyles = function() {
      for ( var i=0; i<this.group.size(); i++ ){
        this.group.item(i).setFontsize( this.opts.fontSize );
        this.group.item(i).fontWeight = this.opts.fontWeight ;
      }
    };
    
    /**
     * calculate the position and angle of each letter
     * @private
     * @method _render
     */       
    CurvedText.prototype._render = function() {
        var curAngle=0,angleRadians=0;
  
        // Calcul centrage du texte
        if ( this.opts.align == 'center' ) { 
          var centrage = ( this.opts.spacing / 2) * ( this.group.size() - 1) ;
        } else if ( this.opts.align == 'right' ) {
          var centrage = ( this.opts.spacing ) * ( this.group.size() - 1) ;
        } else {
          var centrage = 0;
        }
              
        for ( var i=0; i<this.group.size(); i++) {    
          // Calcul des coordonnées de la lettre (penser à convertir en radians : angle*(Math.PI / 180)
          if ( this.opts.reverse ) { 
            curAngle = (-i * parseInt( this.opts.spacing )) - parseInt( this.opts.rotate ) + centrage;
            angleRadians = curAngle * (Math.PI / 180);
            this.group.item(i).set( 'top', (Math.cos( angleRadians ) * this.opts.radius) + this.opts.top);
            this.group.item(i).set( 'left', (-Math.sin( angleRadians ) * this.opts.radius) + this.opts.left );
          } else {
            curAngle = (i * parseInt( this.opts.spacing )) + parseInt( this.opts.rotate ) - centrage;
            angleRadians = curAngle * (Math.PI / 180);            
            this.group.item(i).set( 'top', (-Math.cos( angleRadians ) * this.opts.radius) + this.opts.top );
            this.group.item(i).set( 'left', (Math.sin( angleRadians ) * this.opts.radius) + this.opts.left) ;    
          } 
          this.group.item(i).setAngle( curAngle );
        }
        
        // Update group coords
        this.group._calcBounds()
        this.group._updateObjectsCoords()
        this.canvas.renderAll();      
    };        
  
    /**
     * Default options
     */      
    CurvedText.defaults = {
      top:          100,
      left:         100,      
      spacing:      20,
      rotate:       0,
      radius:       50,
      text:         'Curved text',
      align:        'center',
      reverse:      false,
      fontSize:     20,
      fontWeight:   'normal',
      selectable:   false
    };    

    return CurvedText;
})();