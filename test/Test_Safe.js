// fuser -k 8545/tcp
const expectRevert = require('./assertRevert');

const ABI_tkn = require('./ABI_token');// remote token 

var Web3 = require('web3'); 
const Safe = artifacts.require("./Safe.sol");

// use the given Provider, e.g in Mist, or instantiate a new websocket provider
var web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:8545'); 
var GasCost = 470000;
var gasPrice_value = 200000000000; 
let meta;
let token = "0xbeb425953fb203c36aba395a3541d79aba1ae8b1";
let _lockup = 1530299334; 
let contract_token
let _lockup_investor = _lockup + 60;


contract('Safe check ', ( accounts) => {

    let investor =  [ accounts[7],
                     accounts[9],
                    "0x44a111ad79dfe5b426e71dafc835fe384a353053",
                    "0xc6aeb3ac91468c4d6e8fab8c862de5cc79413e7c",
                    "0xc3fe88024d60114362a96f49ffb6bd6ae6303d6f",
                    ];
    
    let address_current;
       accounts = [ accounts[0],
                    accounts[1],
                    accounts[2],
                    accounts[3],
                    accounts[4],
                    accounts[5], 
                    accounts[6], 
                    accounts[7], 
                    accounts[8],
                    accounts[9]];
 

   it("Загрузка контракта sofe "+accounts[0] + ", "+accounts[1] + ", "+accounts[2] + ", "+accounts[3], function() {
        return Safe.deployed(accounts[0],accounts[1],accounts[2],accounts[3]).then(function(instance) {
            meta = instance; 
            contract_token = new web3.eth.Contract(ABI_tkn, token);
            contract_token.methods.transfer( meta.address , 100500).send({   from: accounts[8]  });
            accounts[6] =  meta.address ;
           // .then(console.log).catch(console.error);
        });
    });
    it("Покупка токенов на текущий контракт ", function() {});

    it("Установка ключей первого уровня" , function() {
        return meta.AuthStart( {from: accounts[0], gas:  GasCost ,gasPrice:gasPrice_value}).then(function(result) {
            return meta.getlastSafeKey().then((result ) => {
                    assert.equal(result  , accounts[0], 'Address does not match lastSafeKey'); 
                    return meta.count.call();
                }).then( (result ) => {
                    assert.equal(result  , 1 ,'Check variable:count '); 
            })
        }); 
    }); 

    it("Проверка всех методов первого уровня", function() {
            return meta.getTimeOutAuthentication({from: accounts[0]}).then(function(result) {
                assert.equal(result  , 3600 ,'Check time getTimeOutAuthentication()'); 
            return meta.getFreeAmount({from: accounts[0]});
        }).then( (result ) => { 
            assert.equal(result, 0,'Check  Amount'); 
            return meta.getLockupCell(accounts[0], {from: accounts[0]});
        }).then( (result ) => {  
            assert.equal(result, 0,'Check  getLockupCell'); 
        return meta.getBalanceCell(accounts[0], {from: accounts[0]});
        }).then( (result ) => {  
            assert.equal(result, 0,'Check  Amount getBalanceCell'); 
        return meta.getExistCell(accounts[0], {from: accounts[0]});
        }).then( (result ) => {   
            assert.equal(result, 0,'Check getExistCell()'); 
        return meta.getCountOfCell( {from: accounts[0]});
        }).then( (result ) => {  
            assert.equal(result, 0,'Check  getCountOfCell'); 
        return meta.getSafeKey(0, {from: accounts[0]});
        }).then( (result ) => {  
        assert.equal(result, accounts[0],'Check getSafeKey(uint i)'); 
        }); 
    }); 

    it("Авторизация ключами второго уровня -> проверка", function() {
        return meta.AuthStart( {from: accounts[1], gas:  GasCost ,gasPrice:gasPrice_value}).then(function(result) {
            return meta.getlastSafeKey().then((result ) => {
                    assert.equal(result  , accounts[1], 'Address does not match lastSafeKey'); 
                    return meta.count.call();
                }).then( (result ) => {
                    assert.equal(result  , 2 ,'Check variable:count '); 
                })
            }); 
        }); 

        it("Авторизация ключами 3 уровня -> проверка", function() {
            return meta.AuthStart( {from: accounts[2], gas:  GasCost ,gasPrice:gasPrice_value}).then(function(result) {
                return meta.getlastSafeKey().then((result ) => {
                    assert.equal(result  , accounts[2], 'Address does not match lastSafeKey'); 
                    return meta.count.call();
                }).then( (result ) => {
                    assert.equal(result  , 3 ,'Check variable:count '); 
                })
            }); 
        }); 

        it("Авторизацтя ключами 4 уровня -> проверка", function() {
            return meta.AuthStart( {from: accounts[3], gas:  GasCost ,gasPrice:gasPrice_value}).then(function(result) {
                return meta.getlastSafeKey().then((result ) => {
                    assert.equal(result  , accounts[3], 'Address does not match lastSafeKey'); 
                    return meta.count.call();
                }).then( (result ) => {
                    assert.equal(result  , 4 ,'Check variable:count '); 
                })
            }); 
        }); 

        it("Изменение ключей доступа accounts[3] => accounts[8]", function() {
            return meta.changeKey(accounts[3],accounts[8], {from: accounts[3], gas:  GasCost ,gasPrice:gasPrice_value}).then(function(result) {
                return meta.getlastSafeKey().then((result ) => {
                    assert.equal(result  , accounts[3], 'Address does not match lastSafeKey'+result); 
                })
            }); 
        }); 

        it("Вызов ошибки: Выход старым аккаунтом который уже не существует AuthEnd() "+accounts[3], function() {
            return    expectRevert(meta.AuthEnd( {from: accounts[3], gas:  GasCost ,gasPrice:gasPrice_value}) ) ;  
        }); 

        it("Проверка первого доспупа первого уровня", function() {
            return meta.getTimeOutAuthentication({from: accounts[3]}).then(function(result) {
                assert.equal(result  , 3600 ,'Check time getTimeOutAuthentication()'); 
         }); 
        }); 

        it("обрыв сессии AuthEnd() новым аккаунтом", function() {
            return meta.AuthEnd( {from: accounts[8], gas:  GasCost ,gasPrice:gasPrice_value}).then(function(result) {
            });   
        }); 

        it("Авторизация всеми ключами", function() {
            meta.AuthStart({from: accounts[0], gas:  GasCost ,gasPrice:gasPrice_value});
          //  meta.AuthStart({from: accounts[1], gas:  GasCost ,gasPrice:gasPrice_value});
            meta.AuthStart({from: accounts[2], gas:  GasCost ,gasPrice:gasPrice_value});

            return meta.AuthStart({from: accounts[8], gas:  GasCost ,gasPrice:gasPrice_value}).then(function(result) {
                return meta.count.call();
            }).then( (result ) => {
                assert.equal(result  , 3 ,'Check variable:count '+result); 
            })
 
        }); 

        // Second past
        it("Установка адреса токена setContract()", function() {
            return meta.setContract(token, _lockup, {from: accounts[8], gas:  GasCost ,gasPrice:gasPrice_value}).then(function(result) {
                return meta.getMainBalance.call();
            }).then( (result ) => {
                assert.equal(result  , 100500 ,'Check variable:count '+result + ' token '+token); 
            });   
        }); 

        it("Проверка на ошибки: Повторная установка адреса контракта", function() {
            return expectRevert(meta.setContract(token, _lockup, {from: accounts[8], gas:  GasCost ,gasPrice:gasPrice_value}));
        }); 
         
        it("Установка новой ячейки, адреса инвестора -> проверка "+investor[0], function() {
            return meta.setCell(investor[0], _lockup_investor, {from: accounts[8], gas:  GasCost ,gasPrice:gasPrice_value}).then(function(result) {
            return meta.getLockupCell.call(investor[0], {from: accounts[8]});
            }).then( (result ) => {
                assert.equal(result  , _lockup_investor ,'Established time '); 
                return meta.getBalanceCell.call(investor[0], {from: accounts[8]});
            }).then( (result ) => {
                assert.equal(result  , 0 ,'Balance'); 
                return meta.getExistCell.call(investor[0], {from: accounts[8]});
            }).then( (result ) => {
                assert.equal(result  , true ); 
                return meta.getCountOfCell.call( {from: accounts[8]});
            }).then( (result ) => {
                assert.equal(result  ,1 ,'count sell '); 
            });   
        });

        it("Проверка на ошибку(0): Установка новой ячейки, адреса инвестора -> проверка "+investor[0], function() {
            return expectRevert(meta.setCell(investor[0], _lockup_investor , {from: accounts[8], gas:  GasCost ,gasPrice:gasPrice_value}));
        }); 

        it("Проверка на ошибку(1): Установка новой ячейки, адреса инвестора -> проверка "+(_lockup_investor-(10**21))+" адрес "+investor[0], function() {
            return expectRevert(meta.setCell(investor[0], (_lockup_investor-(10**1024)) , {from: accounts[8], gas:  GasCost ,gasPrice:gasPrice_value}));
        }); 

        it("Проверка на ошибку(2): Установка новой ячейки, адреса инвестора -> проверка времени "+(_lockup_investor+500000000)+" адрес "+investor[0], function() {
            return expectRevert(meta.setCell(investor[0], (_lockup_investor+500000000) , {from: accounts[8], gas:  GasCost ,gasPrice:gasPrice_value}));
        }); 
 
        it("Добавление инветора: -> проверка "+investor[1] , function() {
            return meta.setCell(investor[1], _lockup_investor, {from: accounts[8], gas:  GasCost ,gasPrice:gasPrice_value}).then(function(result) {
            return meta.getLockupCell.call(investor[1], {from: accounts[8]});
            }).then( (result ) => {
                assert.equal(result, _lockup_investor ,'Established time '); 
                return meta.getBalanceCell.call(investor[1], {from: accounts[8]});
            }).then( (result ) => {
                assert.equal(result, 0 ,'Balance'); 
                return meta.getExistCell.call(investor[1], {from: accounts[8]});
            }).then( (result ) => {
                assert.equal(result, true ); 
                return meta.getCountOfCell.call( {from: accounts[8]});
            }).then( (result ) => {
                assert.equal(result, 2 ,'count sell '); 
            });   
        });
 
        it("Добавление инветора: -> проверка "+ investor[2], function() {
            return meta.setCell(investor[2], _lockup_investor, {from: accounts[8], gas:  GasCost ,gasPrice:gasPrice_value}).then(function(result) {
                return meta.getBalanceCell.call(investor[2], {from: accounts[8]});
            }).then( (result ) => {
                assert.equal(result, 0 ,'Balance'); 
   
            });   
        });

        it("Добавление инветора: -> проверка "+  investor[3], function() {
            return meta.setCell(investor[3], _lockup_investor, {from: accounts[8], gas:  GasCost ,gasPrice:gasPrice_value}).then(function(result) {
                return meta.getBalanceCell.call(investor[3], {from: accounts[8]});
            }).then( (result ) => {
                assert.equal(result, 0 ,'Balance'); 
   
            });   
        });
        
        it("Добавление инвестору в ячейку токенов [depositCell()] 500 : " + investor[0], function() {
            return meta.depositCell( investor[0],   500,  {from: accounts[8], gas:  GasCost ,gasPrice:gasPrice_value}).then(function(result) {
                return meta.getBalanceCell.call(investor[0], {from: accounts[8]});
            }).then( (result ) => {
                assert.equal(result, 500 ,'Balance '+result); 
                return meta.getFreeAmount.call( {from: accounts[8]});
            }).then( (result ) => {
                assert.equal(result, 100000 ,'Balance getFreeAmount'+result); 
            });
        });
        // Функция вывода токенов из ячейки. 
        it("ChangeDepositCell", function() {
            return meta.changeDepositCell( investor[0],   500,  {from: accounts[8], gas:  GasCost ,gasPrice:gasPrice_value}).then(function(result) {

                return meta.getBalanceCell.call(investor[0], {from: accounts[8]});
            }).then( (result ) => {
                assert.equal(result, 0 ,'Balance '+result);  
            }) ;
        });

        it("Изменение ячейки "+investor[0], function() {
            return meta.editCell(investor[0], (_lockup_investor - 50), {from: accounts[8], gas:  GasCost ,gasPrice:gasPrice_value}).then(function(result) {
            return meta.getLockupCell.call(investor[0], {from: accounts[8]});
            }).then( (result ) => {
                assert.equal(result, (_lockup_investor - 50) ,'Established time '); 
                return meta.getBalanceCell.call(investor[0], {from: accounts[8]});
            }).then( (result ) => {
                assert.equal(result, 0 ,'Balance'); 
                return meta.getExistCell.call(investor[0], {from: accounts[8]});
            }).then( (result ) => {
                assert.equal(result, true ); 
          
            });   
        });

        it("Проверка на ошибки : изменение ячейки"+investor[0], function() {
            return expectRevert(meta.editCell(investor[0], 100, {from: accounts[8], gas:  GasCost ,gasPrice:gasPrice_value}));
        }); 

        it("удаление ранее созданой ячейки инвестора", function() {
            return meta.deleteCell(investor[2], {from: accounts[8], gas:  GasCost ,gasPrice:gasPrice_value}).then(function(result) {
            return meta.getLockupCell.call(investor[2], {from: accounts[8]});
            }).then( (result ) => {
                assert.equal(result  , 0 ,'Established time '); 
                return meta.getBalanceCell.call(investor[2], {from: accounts[8]});
            }).then( (result ) => {
                assert.equal(result  , 0 ,'Balance'); 
                return meta.getExistCell.call(investor[2], {from: accounts[8]});
            }).then( (result ) => {
                assert.equal(result, false ); 
                return meta.getCountOfCell.call( {from: accounts[8]});
            }).then( (result ) => {
                assert.equal(result  ,3 ,'count sell '+result); 
            });   
        });

        it("Проверка на ошибку: изменение удалённой ячейки" +investor[2], function() {
            return expectRevert(meta.editCell(investor[2], 100, {from: accounts[8], gas:  GasCost ,gasPrice:gasPrice_value}));
        }); 

        it("Проверка на ошибку: добавление на баланс удалённому инвестору " + investor[2], function() {
            return expectRevert(meta.depositCell( investor[2],  1000,  {from: accounts[8], gas:  GasCost ,gasPrice:gasPrice_value}));
        }); 

      it("Добавляем инвестору токенов [depositCell()] 2 past -  1000 : " + investor[0], function() {
        return meta.depositCell( investor[0],   1000,  {from: accounts[8], gas:  GasCost ,gasPrice:gasPrice_value}).then(function(result) {
            return meta.getBalanceCell.call(investor[0], {from: accounts[8]});
        }).then( (result ) => {
            assert.equal(result, 1000 ,'Balance '+result); 
            return meta.getFreeAmount.call( {from: accounts[8]});
        }).then( (result ) => {
            assert.equal(result, 99500 ,'Balance getFreeAmount'+result); 
        });
        });

      it("Вывод токенов из ячейки :  10 token : " + investor[0], function() {
        return meta.withdrawCell( 10,  {from: investor[0], gas:  GasCost ,gasPrice:gasPrice_value}).then(function(result) {
                return meta.getBalanceCell.call(investor[0], {from: accounts[8]});
            }).then( (result ) => {
                assert.equal(result, 990 ,'Balance '+result); 
            return meta.getFreeAmount.call( {from: accounts[8]});
            }).then( (result ) => {
                assert.equal(result, 99500 ,'Balance getFreeAmount'+result); 
            });
        });

    it("Трансфер токенов самому себе: 10 token :" + investor[0], function() {
        return meta.transferCell(investor[0], 10,  {from: investor[0], gas:  GasCost ,gasPrice:gasPrice_value}).then(function(result) {
                return meta.getBalanceCell.call(investor[0], {from: accounts[8]});
            }).then( (result ) => {
                assert.equal(result, 990 ,'Balance '+result); 
            return meta.getFreeAmount.call( {from: accounts[8]});
            }).then( (result ) => {
                assert.equal(result, 99500 ,'Balance getFreeAmount'+result); 
        });
     });

    it("Трансфер токенов на удалённую ячейку : 10 token :" + investor[0], function() {
        return expectRevert(meta.transferCell(investor[2], 10,  {from: investor[0], gas:  GasCost ,gasPrice:gasPrice_value}));
             
     });

    it("Перевод токенов другому инвестору : 10 token : from " + investor[0]+' to :'+  investor[1], function() {
        return meta.transferCell(investor[1], 10,  {from: investor[0], gas:  GasCost ,gasPrice:gasPrice_value}).then(function(result) {
                return meta.getBalanceCell.call(investor[0], {from: accounts[8]});
            }).then( (result ) => {
                assert.equal(result, 980 ,'Balance '+result); 
                return meta.getBalanceCell.call(investor[1], {from: accounts[8]});
            }).then( (result ) => {
                assert.equal(result, 10 ,'Balance '+result); 
        });
     });

     it("Вывод токенов из ячейки: 5 token : " + investor[1], function() {
        return meta.withdrawCell( 5,  {from: investor[1], gas:  GasCost ,gasPrice:gasPrice_value}).then(function(result) {
            return meta.getBalanceCell.call(investor[1], {from: accounts[8]});
        }).then( (result ) => {
            assert.equal(result, 5 ,'Balance '+result); 
        });
    });

    it("Проверка на ошибку: вывод несуществующих токенов  : 50 token : " + investor[1], function() {
        return expectRevert(meta.withdrawCell( 50,  {from: investor[1], gas:  GasCost ,gasPrice:gasPrice_value}) );
    });

    it("Проверка на ошибку: вывод отрицательное количество токенов  : -50 token : " + investor[1], function() {
        return expectRevert(meta.withdrawCell( -50,  {from: investor[1], gas:  GasCost ,gasPrice:gasPrice_value}) );
    });

});