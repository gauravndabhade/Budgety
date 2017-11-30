var BugdetController = (function() {
    var Data;

    var Expence = function(id, description, value) {
    	this.id = id;
    	this.description = description;
    	this.value = value;
        this.percentage = -1;
    }

    Expence.prototype.calPercentage =function(totalIncome){

        if(Data.Total.inc > 0 ) {
            this.percentage = Math.round((this.value / Data.Total.inc) * 100);
        } else {
            Data.percentage = -1;
        }
    };

    Expence.prototype.getPercentage = function() {
        return this.percentage;
    };
    var Income = function(id, description, value) {
    	this.id = id;
    	this.description = description;
    	this.value = value;
    }
    var calculateTotal = function(type) {
        var sum=0;
        Data.AllItems[type].forEach(function(cur) {
            sum = sum + cur.value;
        });
        Data.Total[type] = sum;
    };

    Data = {
    	AllItems :
    	{
    		exp : [],
    		inc : []
    	},

    	Total :
    	{
    		exp : 0,
    		inc : 0
    	},
        budget: 0,
        percentage: -1
    };
    return {
        test : function() {
            console.log(Data);
        },
        calculateBudget : function() {
            // calculate totals
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate budgets
            Data.budget = Data.Total.inc - Data.Total.exp;

            //calculate percentage
            if(Data.Total.inc > 0 ) {
                Data.percentage = Math.round((Data.Total.exp / Data.Total.inc ) * 100);   
            } else {
                Data.percentage = -1;
            }
            
        },
        calculatePercentages: function() {
            Data.AllItems.exp.forEach(function(current) {
                current.calPercentage();
            });
        },

        getPercentages : function() {
            var allPer;
            allPer = Data.AllItems.exp.map(function(cur){
                return cur.getPercentage()
            });
            return allPer;
        },
        getBudget : function() {
            return {
            Budget : Data.budget,
            TotalInc : Data.Total.inc,
            TotalExp : Data.Total.exp,
            Percentage : Data.percentage
            };
        },
        deleteItem : function(type, id) {
            var ids,index;
            ids = Data.AllItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id); 

            if(index !== -1) {
                Data.AllItems[type].splice(index,1);
            }
        },
    	addItem : function(type,dec,val) {
    		var newItem,ID;
    		if(Data.AllItems[type].length > 0) {
    			ID = Data.AllItems[type][Data.AllItems[type].length - 1].id + 1;
    		} else {
    			ID = 0;
    		}
    		

    		if(type === 'exp') {
    			newItem = new Expence(ID, dec, val);
    		} else if(type === 'inc') {
    			newItem = new Income(ID, dec, val);	
    		}

    		Data.AllItems[type].push(newItem);
    		return newItem;
    		
    	}
    };
})();





var UIController = (function() {
    var DOMString= {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel : '.budget__value',
        incomeLabel :'.budget__income--value',
        expensesLabel :'.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container',
        expansesPercentageLabel : '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    formateNumber = function(no,type) {
        var splitNum,dec,int;

        no = Math.abs(no);
        no = no.toFixed(2);

        splitNum = no.split('.');

        int = splitNum[0];
        dec = splitNum[1];

        if(int.length > 3) {
            int  = int.substr(0,int.length - 3)+ ','+int.substr(int.length - 3,3);
        }

        return (type === 'inc'? '+' : '-')+' '+int+'.'+dec;
    };

    var listForEach = function(list,callback) {
        for(var i=0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMString.inputType).value,
                description: document.querySelector(DOMString.inputDescription).value,
                value: parseFloat(document.querySelector(DOMString.inputValue).value)
            }
        },
        updateBudgetUI : function(obj) {
            var type;
            obj.Budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMString.budgetLabel).textContent = formateNumber(obj.Budget,type);
            document.querySelector(DOMString.incomeLabel).textContent = formateNumber(obj.TotalInc,'inc');
            document.querySelector(DOMString.expensesLabel).textContent = formateNumber(obj.TotalExp,'exp');
            

            if(obj.Percentage >0) {
                document.querySelector(DOMString.percentageLabel).textContent    = obj.Percentage + '%';
            } else {
                document.querySelector(DOMString.percentageLabel).textContent    = '---';
            }
            
        },
        updatePercentageUI : function(percentage) {
            var list;

            list = document.querySelectorAll(DOMString.expansesPercentageLabel);
            listForEach(list,function(current,index) {
                if(percentage[index] > 0) {
                    current.textContent    = percentage[index] + '%';
                } else {
                    current.textContent    = '---';
                }
            });
        },


        getDOMString: function() {
            return DOMString;
        },
        addItemUI: function(object,type) {
            //placeholder html string
            var html, newHtml, element;

            if(type === 'inc') {
                element = DOMString.incomeContainer;
                html ='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else{
                element = DOMString.expenseContainer;
                html ='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //replace
            newHtml = html.replace('%id%',object.id);
            newHtml = newHtml.replace('%description%',object.description);
            newHtml = newHtml.replace('%value%',formateNumber(object.value,type));


            //add ui
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        deletItemUI: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },
        displayDate: function() {
            var now,months,month,year;
            months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();

            document.querySelector(DOMString.dateLabel).textContent = months[month]+' '+year;
        },
        changedType: function() {

            var list = document.querySelectorAll(
                DOMString.inputType +','+
                DOMString.inputDescription +','+
                DOMString.inputValue);

            listForEach(list, function(current){
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMString.inputBtn).classList.toggle('red');
        },
        clearField:  function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMString.inputDescription +','+ DOMString.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array){
                current.value = "";
                fieldsArr[0].focus();
            });
        }
    } 
})();





var controler = (function(BudgetCtrl,UICtrl) { 
    
    var setEventListeners = function() {
        var DOM = UICtrl.getDOMString();
        
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
        document.addEventListener('keypress',function(e) {
            if(e.keyCode === 13 || e.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
    }
    var updateBudget = function() {
            var budget;
        // calculate Budget
        BudgetCtrl.calculateBudget();
        // get Budget
        budget = BudgetCtrl.getBudget();

        //update budget
        UIController.updateBudgetUI(budget);

    }
    var updatePercentage =function() {
        var per;
        // calculate percentage
        BudgetCtrl.calculatePercentages();

        //read percentage
        per = BudgetCtrl.getPercentages();

        //Update UI
        UICtrl.updatePercentageUI(per);
        console.log(per); 


    }
    var ctrlDeleteItem = function(event) {

        var ItemID,SplitID,type,id;

        ItemID = event.target.parentNode.id;
        if (ItemID) {
            SplitID = ItemID.split('-');
            type = SplitID[0];
            id = parseInt(SplitID[1]);

            BudgetCtrl.deleteItem(type, id);

            UICtrl.deletItemUI(ItemID);

            updateBudget();

            //Calculate percentages
            updatePercentage();
        }
    }
    var ctrlAddItem = function() {
        // Get Inputs
        var input = UICtrl.getInput(); 

        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //Store in Data Structure
            var obj = BudgetCtrl.addItem(input.type, input.description, input.value);
            //Display on UI
            UICtrl.addItemUI(obj,input.type);
            //clear the fields
            UICtrl.clearField();
            //Calculate Budget and Update UI
            updateBudget();

            //Calculate percentages
            updatePercentage();

        }
        

    }
    
    return {
        init: function() {
            console.log('Application has started.');
            UIController.displayDate();
            UIController.updateBudgetUI({Budget : 0,
            TotalInc : 0,
            TotalExp : 0,
            Percentage : -1
            });
            setEventListeners();
        }
    }
})(BugdetController, UIController);

controler.init();