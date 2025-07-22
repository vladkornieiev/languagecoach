package com.vk.languagecoach.controller;


import com.vk.languagecoach.dto.request.tts.TextToSpeechRequest;
import com.vk.languagecoach.dto.response.tts.TextToSpeechResponse;
import com.vk.languagecoach.dto.response.tts.TextToSpeechTextChunkResponse;
import com.vk.languagecoach.dto.response.tts.TextToSpeechTextResponse;
import com.vk.languagecoach.service.TextToSpeechService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
@RequestMapping("/api/text-to-speech")
@RequiredArgsConstructor
public class TextToSpeechController {

    private final TextToSpeechService textToSpeechService;

    @PostMapping(produces = "application/zip")
    public ResponseEntity<ByteArrayResource> textToSpeech(@RequestBody TextToSpeechRequest request) throws IOException {
        byte[] zipBytes;

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ZipOutputStream zipOut = new ZipOutputStream(baos)) {

            TextToSpeechResponse response = textToSpeechService.textToSpeech(request);

            for (TextToSpeechTextResponse textResponse : response.getTexts()) {
                for (TextToSpeechTextChunkResponse chunk : textResponse.getChunks()) {
                    ZipEntry zipEntry = new ZipEntry(chunk.getName());
                    zipOut.putNextEntry(zipEntry);
                    zipOut.write(chunk.getAudio().getByteArray());
                    zipOut.closeEntry();
                }
            }

            zipOut.finish();  // optional, safe to call
            zipBytes = baos.toByteArray();
        }

        ByteArrayResource zipResource = new ByteArrayResource(zipBytes);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"files.zip\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(zipResource.contentLength())
                .body(zipResource);
    }
}
