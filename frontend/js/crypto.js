var crypto = {
    init: function() {
        sjcl.random.startCollectors();
    },
    createRandomChallenge: function() {
        var randomWords = sjcl.random.randomWords(128);
        return sjcl.codec.base64.fromBits(randomWords);
    },
    createSalt: function() {
        return sjcl.random.randomWords(2,0);
    },
    initializePassword: function(password) {
        var salt1 = this.createSalt();
        var effectiveCount = 50000;
        var effectivePassword = sjcl.codec.base64.fromBits(sjcl.misc.pbkdf2(password, salt1, effectiveCount));
        var challenge = this.createRandomChallenge();
        var challengeCipher = sjcl.encrypt(effectivePassword, challenge);
        var challengeCipherObj = JSON.parse(challengeCipher);
        var challengeCipherText = challengeCipherObj.ct;
        delete challengeCipherObj.ct;
        var challengeCipherHash = sjcl.hash.sha256.hash(challengeCipherText);
        return {
            effectivePassword: effectivePassword,
            effectivePasswordParams: {
                salt1: sjcl.codec.base64.fromBits(salt1),
                count: effectiveCount
            },
            challenge: challenge,
            challengeParams: challengeCipherObj,
            challengeHash: sjcl.codec.base64.fromBits(challengeCipherHash)
        };
    },
    computeEffectivePassword: function(password, effectivePasswordParams) {
        return sjcl.codec.base64.fromBits(sjcl.misc.pbkdf2(password, sjcl.codec.base64.toBits(effectivePasswordParams.salt1), effectivePasswordParams.count));
    },
    computeChallengeHash: function(effectivePassword, challenge, challengeParams) {
        var challengeCipher = JSON.parse(sjcl.encrypt(effectivePassword, challenge, challengeParams));
        return sjcl.hash.sha256.hash(challengeCipher.ct);
    },
    checkChallengeHash: function(effectivePassword, challenge, challengeParams, challengeHash) {
        return challengeHash === sjcl.codec.base64.fromBits(this.computeChallengeHash(effectivePassword, challenge, challengeParams));
    },
    performTests: function() {
        var obj = this.initializePassword('foobar');

        // Test effective password computes correctly.
        var eff2 = this.computeEffectivePassword('foobar', obj.effectivePasswordParams);
        if (eff2 !== obj.effectivePassword) {
            console.log("ERROR: effective password doesn't compute");
        }

        // Test challenge hash
        if (!this.checkChallengeHash(eff2, obj.challenge, obj.challengeParams, obj.challengeHash)) {
            console.log("ERROR: challenge hash should match");
        }

        // Test wrong password gives different effective password.
        var eff3 = this.computeEffectivePassword('foobaR', obj.effectivePasswordParams);
        if (eff3 === obj.effectivePassword) {
            console.log("ERROR: effective password shouldn't be same");
        }

        // Test challenge fails with wrong password
        if (this.checkChallengeHash(eff3, obj.challenge, obj.challengeParams, obj.challengeHash)) {
            console.log("ERROR: challenge hash shouldn't match");
        }

        console.log("All tests performed.")
    }
};

module.exports = crypto;
